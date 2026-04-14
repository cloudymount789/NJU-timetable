# 工程结构与组件复用策略

本文档对应 `frontend-functional-spec.md` 中的「组件树与复用策略」延伸，**不重复**功能流与字段表（分别见功能文档与 `frontend-data-and-state-contract.md`）。目标：让实现者在选框架（React/Vue/原生）时仍能落地**一致的目录边界与组件分层**。

---

## 1. 路由与原型画板映射

| 路由段（建议） | 原型画板 | 备注 |
| --- | --- | --- |
| `/timetable` | `02 Week Timetable` | 底部 Tab「课表」 |
| `/features` | `12 Functions Hub` | 底部 Tab「功能」 |
| `/todo` | `15 Todo` | 底部 Tab「待办」 |
| `/import` | `01 Import & Login` | 加号菜单 |
| `/courses/new` | `11 Manual Add Course` | |
| `/courses` | `14 All Courses` | |
| `/courses/:id` | `03 Course Detail` |含提醒子页或内嵌路由 `/courses/:id/reminder` |
| `/settings` | `06 Settings & Appearance` | |
| `/calendar` | `10 Semester Overview` | |
| `/exams` | `05 Exams & Homework` | |
| `/exams/new` | `18 Add Exam/Homework` | |
| `/exams/:id` | `19 Exam/Homework Detail` | |
| `/todo/:id` | `15b Todo Detail` | |
| `/logs` | `16 My Logs` | |
| `/logs/:id` | `17 Log Editor` | 新建与编辑可同页 |

深链接与返回栈：二级页统一 `push`，返回 `pop`；**重进 App** 仍落默认 Tab与默认主课表（需求）。

---

## 2. 目录结构（推荐骨架）

以下为**逻辑分层**，具体文件夹名可按栈调整，但依赖方向建议保持不变：

```text
app/
  layout/               # AppShell、SafeArea、TabBar 可见性
  routes/
features/
  timetable/            # 周网格、课程块、周切换
  course/               # 详情、编辑态、资料、提醒
  import/               # 教务、OCR、预览合并
  calendar/
  exams/
  todo/
  logs/
  settings/
domain/                 # 纯函数：周次计算、weekRule 解析、冲突分栏
state/                  # store：按 feature 切片或单一 store
data/                   # 持久化、备份、文件适配器
shared/
  ui/                   # 设计系统级组件（Button、Switch、Capsule、Dialog）
  hooks/                # useTheme、useConfirm、useThrottleSubmit
  lib/                  # id、date、formatSecond
```

**依赖规则**：`shared`不得引用 `features`；`domain` 不得引用 UI；`features` 可引用 `domain` 与 `shared`。

---

## 3. 组件分层（复用策略）

### 3.1 壳层 `AppShell`

- **职责**：状态栏占位、顶栏槽位、内容区、底部 Tab 显隐。
- **规则**：仅 `/timetable`、`/features`、`/todo` 显示 `BottomTab`；其余路由隐藏（与需求一致）。

### 3.2 复合组件（Feature 内复用）

| 组件 | 职责边界 |
| --- | --- |
| `TimetableGrid` | 接收「列=星期、行=节次」与 `CourseSegment[]`；负责隐形网格对齐、冲突分栏 |
| `CourseBlock` | 单门课渲染：标题 + 第一行灰字教室；只处理展示，不直接请求 |
| `Capsule` | 主/次变体；加号、打勾、描边批量编辑等统一入口 |
| `SettingsSwitch` | 与设置页完全同一套轨道样式；业务页禁止 duplicate一套 switch |
| `ConfirmDialog` | 删除、擦除日历标、退出导入等统一二次确认 |
| `CalendarMonth` | 月标题行 + 左右箭头 + 图例；`DayCell` 只管单日绘制 |
| `TodoRow` | 左序号、右完成/DLL/起始时间三态；批量编辑切换右侧为删除 |

### 3.3 页面本地组件

表单分段（课程基本信息、时间节次、适用周次）允许页面内聚，但一旦第二处复用（如考试关联课程选择器），上移到 `features/course/components`。

---

## 4. 设计令牌与消费者

- **单一来源**：颜色、边框、玻璃效果、课表专用文字色等只从令牌读取（与 `requirements document.md` 第四节一致）。
- **消费方式**：CSS 变量注入或主题对象；切换 `light`/`dark` 时**不得**在业务组件写死 `#fff`。
- **课表可读性**：深色下课表文字使用专用令牌（功能文档已强调），`CourseBlock` 与 `TimetableGrid` 必须同一套。

---

## 5. 性能与渲染注意点

- 周视图：`Course` 过滤与 `weekRule` 解析放在 `useMemo` / selector，避免拖拽或主题切换时全量重算。
- 月历：按「可见月」懒加载派生标注，不在全局日维度全量监听。
- 待办拖拽：仅更新 `manualRank` 与受影响行，避免整表 key 抖动。

---

## 6. 与需求自查表的对齐方式

删除入口、日历擦除、课表管理删除等**分散在多页**的实现，建议在 `features` 各模块用 **单一 use-case函数**（如 `deleteCourseCascade`）封装，便于与 `requirements document.md` 第十四章表格逐条对照与单测。
