# 数据与状态契约（本地优先）

本文档约定**前端状态分层、持久化边界与跨模块一致性**，不重复叙述交互细节（见 `frontend-functional-spec.md`）与产品口径（见 `requirements document.md`）。当前产品以**单机本地存储为数据真源**；教务/OCR 等若经可选服务端中转，REST 形状与分期见 [`backend-design.md`](./backend-design.md)。若未来进入「云端真源」，可在此文档增补「同步向量 / 冲突解决」章节。

---

## 1. 持久化根与版本

| 键 / 约定 | 说明 |
| --- | --- |
| `storageVersion` | 整型；迁移脚本据此升级本地 schema |
| `appPreferences` | 主题、主题色、课表显示开关、开学日等**非大对象**配置 |
| `timetables[]` | 多份课表容器；每项含 `id`、`name`、`isDefault`、`courses[]` 等 |
| `examsHomework[]` | 考试与作业统一模型，用 `kind` 区分 |
| `todos[]` | 待办 |
| `logs[]` | 日志 |
| `calendarMarks` | 手动重要日、用户层覆盖；与「考试同步」「只读假期」的合成规则在实现层文档化 |
| `remindersByCourseId` | 按课程的提醒策略（自课程详情进入配置） |

**原则**：写入须**事务化或批量提交**（避免半写入导致列表与详情不一致）；删除课程 / 课表 / 考试等待办联动在**同一逻辑单元**内完成或明确异步补偿。

---

## 2. 实体最小字段（实现可扩展）

以下为**验收与联调用最小集合**；字段名可按栈（TS/Zod 等）映射，语义须一致。

### 2.1 Timetable（课表实例）

- `id`, `name`, `isDefault: boolean`
- `courses: Course[]`

### 2.2 Course

- `id`, `timetableId`, `name`, `teacher?`, `room?`, `weekPattern`（单双周/指定周等结构化表示）, `weekday`, `periodStart`, `periodEnd`
- `showOnGrid: boolean`
- `colorKey` 或 `colorToken`（与全局配色表映射）
- **详情扩展**：成绩构成、评价维度、资料 `attachments[]`、链接、教师信息、备注等（大段文本）
- `reminder?:` 嵌套或外键到 `remindersByCourseId[courseId]`

### 2.3 Attachment（课程资料）

- `id`, `courseId`, `displayName`, `localUri` 或 `blobRef`, `mime?`, `createdAt`（ISO 8601，精确到秒）

### 2.4 ExamHomework

- `id`, `kind: 'exam' | 'homework'`
- 考试：`startsAt?`, `location?`, `linkedCourseId?`, `examType?`, `note?`
- 作业：`deadlines[]`（多天规则）, `linkedContent?`, `repeatRule?`
- `createdAt`, `updatedAt`

### 2.5 Todo

- `id`, `title`, `body?`, `place?`
- `category: 'duration' | 'ddl' | 'plain'`
- `startAt?`, `endAt?`, `dueAt?`
- `importance: 1 | 2 | 3`（与 UI 三档对应）
- `reminderEnabled`, `reminderAt?`
- `progressLog[]`: `{ at: ISO8601, text: string }`（时间**精确到秒**）
- `colorTheme?`, `done: boolean`, `sortIndex?`
- `linkedExamHomeworkId?`（若由考试作业同步）

### 2.6 Log

- `id`, `title`, `body`
- `createdAt`, `updatedAt`（列表与详情展示**到秒**；二次编辑可展示 `updatedAt`）

### 2.7 CalendarMark（用户可擦除部分）

- `date`（日历日，无时区或本地日界线约定写死）
- `type`, `title`, `note?`, `source: 'manual' | 'synced-exam' | 'holiday-readonly'`（实现用；**擦除**行为按 `requirements document.md` 学期日历条区分）

---

## 3. 路由参数与页面所需状态

| 路由 / 页面 | 必备入参 | 读写的全局/会话状态 |
| --- | --- | --- |
| 周课表 | `timetableId?`（默认当前）, `weekIndex` | 当前课表、当前周、加号菜单展开 |
| 课程详情 | `courseId` | 编辑态布尔；保存后 invalidate课表与全部课程 |
| 考试作业列表 | — | 筛选排序 |
| 考试作业详情 | `itemId` | 编辑态 |
| 待办列表 | — | 筛选、排序模式、批量编辑态 |
| 待办详情 | `todoId` | 编辑态、主题色弹层 |
| 日志列表 /详情 | `logId?` | 编辑态 |
| 日历 | `focusedDate?` | 选中格、当月、当日面板 |
| 设置 | — | 偏好即时写 `appPreferences` |

---

## 4. 跨模块一致性（invalidate 规则）

| 事件 | 至少刷新 |
| --- | --- |
| 保存 / 删除课程 | 当前课表网格、全部课程列表、课程详情缓存、（可选）日历上与该课关联的展示 |
| 删除考试作业 | 列表、详情、待办（若已同步）、日历考试标记 |
| 待办完成 / 删除 | 列表、详情、日历「当日待办」 |
| 开关「关联考试与作业」 | 全量或增量同步待办；持久化标志位 |
| 课表管理删除非主课表 | 课表列表、若删的是当前选中则切回默认 |
| 擦除日历标记 | 仅影响 `calendarMarks` 与当日面板；不隐式删考试记录除非产品明确 |

---

## 5. 与「后端」的关系

- 教务导入、OCR：可经由**可选后端网关**（阶段 A：服务端通常不持久化用户课表）输出标准 `CourseDraft[]` / `Course[]`，由客户端合并写入 `timetables`。详见 [`backend-design.md`](./backend-design.md)。
- 导出/分享：只读聚合，不改变上述实体。

---

## 文档维护

字段增删改时：先改持久化与迁移策略，再同步本表；交互变化仍以 `frontend-functional-spec.md` 与 `requirements document.md` 为准。若增加或变更服务端 DTO 或导入流程，须同步 [`backend-design.md`](./backend-design.md)。
