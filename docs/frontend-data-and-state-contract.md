# 前端数据与状态契约（实现向）

本文档承接 `frontend-functional-spec.md` 末尾「页面级接口与状态字段」方向，**不写交互步骤**（避免与功能文档重复），只约定：**有哪些业务实体、字段语义、跨模块不变量、各页应订阅/提交的最小状态**。产品细则以 `requirements document.md` 与 `nju-timetable.pen` 为准。

---

## 1. 持久化与运行时假设

- **单机优先**：首版可完全本地持久化（IndexedDB / SQLite /文件导出等由工程选型决定）；不假设必有远程 API。
- **ID 策略**：所有可删除实体使用稳定 `id`（UUID）；关联字段仅存 `id`，避免深拷贝嵌套。
- **时间存储**：统一存 UTC 或本地 `ISO 8601` 字符串；**展示**按用户时区；日志、进度日志等待办相关时间需能**精确到秒**（与需求一致）。
- **主题解析**：运行时维护 `themeMode`（`light` | `dark` | `system`）与解析后的 `effectiveAppearance`；样式只消费设计令牌（如 `$theme.*`），不在业务状态里散落颜色字面量。

---

## 2. 核心实体与字段（最小完备集）

以下为前端状态机与持久化层应对齐的「逻辑模型」。字段可按实现拆表，但语义不应丢失。

### 2.1 `Timetable`（课表壳 / 多份课表）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `name` | string | 列表与胶囊展示名 |
| `isPrimary` | boolean | **唯一**「本人/默认课表」；不可在设置「课表管理」中删除 |
| `createdAt` / `updatedAt` | string | 审计可选 |

**不变量**：至少存在一张 `isPrimary === true` 的课表；删除非主课表时不得破坏该约束。

### 2.2 `Course`（课程）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键 |
| `timetableId` | string | 归属课表 |
| `title` | string | 课程名 |
| `teacher` | string? | 非必填（手动添加关闭「显示在课表」时可为空，见功能文档） |
| `classroom` | string? | 教室 |
| `weekday` | 1–7 | 星期 |
| `startPeriod` / `endPeriod` | number | 与作息表节次对齐；跨节连续课用区间表示 |
| `weekRule` | object | 单周/双周/隔周/指定周等；需可序列化（具体结构实现定，但须能驱动周视图过滤） |
| `color` | string | 课程色（低饱和策略由调色与随机方案保证） |
| `showOnGrid` | boolean | 「是否显示在周课表」 |
| `gradeBreakdown` | object? | 成绩构成（用户自填） |
| `evaluation` | object? | 评价维度多行结构 |
| `materials` | `Material[]` | 资料列表（文件引用） |
| `links` | string? | 课程网站 |
| `teacherContact` | object? | 办公室、答疑、邮箱等 |
| `notes` | string? | 备注 |
| `updatedAt` | string? | 可选 |

`Material`：`{ id, name, uri | blobRef, addedAt }`（实现层决定存储方式）。

**不变量**：`showOnGrid === false` 的课程仍出现在「全部课程」与关联选择器中，但周网格不渲染。

### 2.3 `PeriodSchedule`（作息 / 节次时间）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 主键；可被设置与课表引用 |
| `name` | string? | 如「默认作息」 |
| `segments` | enum? | 上午/下午/晚间划分（若需求要分栏展示） |
| `periods` | `{ index, label?, start, end }[]` | **第 1–12 节**起止；第 7 节及以后规则见 `prompts.md` /需求文档 |
| `semesterStartDate` | string | 与「开学日」一致，驱动教学周计算 |

### 2.4 `CourseReminder`（按课程的提醒配置）

与需求一致：提醒从**课程详情**进入配置，数据按 **courseId** 维度存储（独立 `04 Class Reminders` 全局面可作为默认值模板，但落库须明确优先级：课程覆盖 > 全局默认）。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `courseId` | string | 外键 |
| `leadMinutes` | enum | 如 5/10/15/30 |
| `channels` | flags | 通知/静音/震动/铃声等多选 |
| `skipWeekendsAndHolidays` | boolean | 与需求「周末与法定节假日不触发」对齐 |

### 2.5 `ExamHomework`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string |主键 |
| `kind` | `exam` \| `homework` | |
| `title` | string | 列表主文案 |
| `courseId` | string? | 关联课程 |
| `exam` | object? | `datetime`, `place`, `examType`, `note` |
| `homework` | object? | `ddl`（多天的周几+时间）、`related`, `repeat` |
| `status` | `open` \| `done`? | 列表筛选用（若与待办双向同步需约定单一真源） |
| `updatedAt` | string | |

**与日历**：考试日期应能驱动日历格「考试」类标注（需求：自动读取考试日期）；删除考试须同步移除日历层展示（或标记 stale，由刷新重建）。

### 2.6 `Todo`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | |
| `title` / `body` / `place` | string | |
| `kind` | `duration` \| `ddl` \| `plain` | 三选一 |
| `startAt` / `endAt` | string? | `duration` |
| `dueAt` | string? | `ddl` |
| `importance` | `low` \| `mid` \| `high` | 映射 UI 三档 |
| `remind` | boolean | |
| `remindAt` | string? | |
| `progress` | `{ at, text }[]` | 时间线；时间精度到秒 |
| `accent` | string? | 条目主题色 |
| `completed` | boolean | |
| `manualRank` | number? | 手动排序用 |
| `source` | `manual` \| `exam` \| `homework` | 用于联动与删除策略 |
| `sourceId` | string? | 对应考试/作业 id |
| `isTodayCandidate` | boolean? | 若功能文档定义「当日」筛选，与日历下方待办联动 |

**不变量**：开启「关联考试与作业」后，`source !== manual` 的待办应由系统生成/更新，避免与源记录长期漂移（建议：源记录为真源，待办为投影）。

### 2.7 `LogEntry`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | |
| `title` / `body` | string | |
| `createdAt` / `updatedAt` | string | 列表与详情展示到秒 |
| `lastEditedAt` | string? | 若需求「二次编辑后详情展示上次修改时间」 |

### 2.8 `CalendarLayer`（月历标注）

建议拆两类，避免「擦除」误伤源数据：

| 概念 | 说明 |
| --- | --- |
| `UserMark` | 用户「重要日」等可擦除标记 |
| `DerivedMark` | 由 `ExamHomework`、只读假期数据**派生**的展示（擦除时走确认与分支逻辑，见需求「学期日历」） |

字段示例：`date`（本地日）、`types[]`、`payload`（文案）、`source`（`user` \| `exam` \| `holiday`）。

---

## 3. 全局设置快照 `AppSettings`

与 `06 Settings & Appearance` 对齐的最小集合：

- `themeMode`，`followSystem`，`accentColor`
- `hideWeekend`，`hideEmptyPeriodRows`
- `randomizeCoursePalette`（一次动作，或记录上次随机种子）
- `linkExamHomeworkToTodo`（待办页底部勾选同步）
- `backup` / `export` 相关元数据（路径、最近导出时间——实现可选）

---

## 4. 页面 → 状态订阅矩阵（实现清单）

| 页面（原型名） | 读取 | 写入/副作用 |
| --- | --- | --- |
| 周课表 |当前 `Timetable`、`PeriodSchedule`、当周 `Course` 过滤结果、`AppSettings` 网格开关 | 跳转详情；周切换仅 UI 状态 |
| 导入与登录 | 会话占位、导入预览 | 写入 `Course` /新建 `Timetable` |
| 手动添加课程 | 默认 `timetableId`、校验规则 | `Course` CRUD |
| 全部课程 | 全量 `Course`（含 `showOnGrid=false`） | 仅跳转 |
| 课程详情 | 单 `Course`、`CourseReminder`、`Material` | 编辑保存；删除课程；资料增删；提醒配置 |
| 考试/作业列表 | `ExamHomework`、筛选排序状态 | 跳转新建/详情 |
| 添加/详情考试作业 | 单实体、关联 `Course` | 保存/删除；触发待办投影；刷新日历派生 |
| 待办列表 | `Todo`、筛选/排序、`link` 开关 | 完成态、批量删、拖拽序 |
| 待办详情 | 单 `Todo` | 保存/删除/进度追加 |
| 日历 | `CalendarLayer` 合并视图、当日 `Todo`子集 | 添加重要日、擦除标记（分支逻辑） |
| 日志列表/编辑 | `LogEntry` | 保存/删除 |
| 设置 | `AppSettings`、多 `Timetable` 列表 | 主题、作息、课表管理删除、备份导出 |

---

## 5. 与「后端」的契约

- **详设**：[`backend-design.md`](./backend-design.md)（阶段 A：导入网关 + 可选节假日目录；阶段 B：云同步扩展点）。
- **摘要**：教务与 OCR 经 HTTP 返回 `CourseDraft[]` + `warnings[]`；**合并与真源仍在客户端**（与 `data-and-state-contract.md` 一致）。
- 无后端时，用 **Mock Provider** 实现同一 `ImportProvider` 抽象，避免 UI 与导入策略耦合。

---

## 6. 修订联动

实体或不变量变更时：同步更新 `requirements document.md` 与 `frontend-functional-spec.md`（见项目文档同步规则）。涉及教务/OCR/节假日等服务端契约时，同步 [`backend-design.md`](./backend-design.md) 与 [`data-and-state-contract.md`](./data-and-state-contract.md)。
