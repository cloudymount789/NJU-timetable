# 前端工程结构建议与组件复用

本文档给出**目录与职责拆分**，避免与 `frontend-functional-spec.md` 中的流程描述重复。技术栈未锁定（React / Vue / RN 等均可映射同一结构）。

---

## 1. 顶层目录（建议）

```
src/
  app/                    # 路由、根布局、底部胶囊、主题 Provider
  entities/               # 纯类型、常量、轻量 mapper（course, todo, …）
  shared/
    ui/                   # 设计系统：Button, Capsule, Toggle, SurfaceCard, …
    lib/                  # 日期、周次、节次网格计算、颜色生成
    hooks/                # useTimetableContext, usePersistedState, …
  features/
    timetable/            # 周课表、课表切换、课程块
    course-detail/        # 课程详情、编辑态、资料、提醒入口
    import-login/         # 导入与教务
    settings/             # 设置、课表管理
    calendar/             # 学期日历、重要日、擦除标记
    exams-homework/       # 列表、新增、详情
    todos/                # 列表、详情、批量编辑
    logs/                 # 列表、编辑 widgets/                # 可选：桌面小组件适配层（后期）
```

**依赖方向**：`features → entities, shared`；**禁止** `features/a → features/b` 直接引用页面，共享逻辑上收 `shared` 或 `entities`。

---

## 2. 路由与特性映射

| 原型路由（见功能规格 §4） | feature 目录（建议） |
| --- | --- |
| 02 Week Timetable | `features/timetable` |
| 03 Course Detail | `features/course-detail` |
| 01 Import & Login | `features/import-login` |
| 06 Settings | `features/settings` |
| 10 Semester Overview | `features/calendar` |
| 05 / 18 / 19 | `features/exams-homework` |
| 15 / 15b | `features/todos` |
| 16 / 17 | `features/logs` |
| 12 / 14 等 | 可归入 `timetable` 或 `course-detail` 子页 |

---

## 3. 共享 UI 组件（从原型抽象）

下列与 `nju-timetable.pen` 中重复视觉强相关，应**组件化 + 变量驱动**：

- **顶栏**：状态栏占位、左返回、中间/大标题、右操作（胶囊）
- **胶囊按钮**：主题色主按钮、描边次按钮、图标 + 文案
- **列表行**：考试作业、待办、日志卡片（圆角 + `surface` + `border`）
- **开关**：与设置页轨道一致（`toggleTrack` /滑块）
- **周课表网格**：左侧节次列 + 星期头 + 课程块（冲突分栏）
- **日历**：月格子、图例、今日描边、实色填充格
- **确认弹窗**：删除类二次确认统一组件
- **空态 / 错误态**：导入失败、无数据**命名**：优先语义化（`TimetableGrid`, `CourseBlock`, `CapsuleButton`），避免页面内复制粘贴。

---

## 4. 状态管理建议

- **全局**：当前 `timetableId`、`weekIndex`、主题、`appPreferences`。
- **页面级**：编辑态、弹层开闭、列表筛选排序；离开路由时可丢弃。
- **服务端无关**：持久化通过单一 `storage` 模块封装（便于测试 mock）。

---

## 5. 与需求文档的对应方式

- 删除入口、课表管理「主课表无 ×」等**业务规则**以 `requirements document.md` 为准。
- 本文件只回答「代码放哪、谁复用谁」；字段细节见 `data-and-state-contract.md`。

---

## 文档维护

新增画板/路由时：在 **§2** 增一行映射；若引入新跨页组件，在 **§3** 增补。
