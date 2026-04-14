# NJU Timetable — 开发日志（自主迭代）

> 说明：按专业工程节奏记录**计划 → 小步 → 验证 → 提交**。界面以 `docs/requirements document.md` 与 `docs/frontend-functional-spec.md` 为准；`UI/nju-timetable.pen` 为视觉真源（Pencil 在本环境打开超时则用文字规格与变量约定对齐）。

## 当前迭代目标

- Monorepo：`app/mobile` + `packages/domain` + `packages/contracts`
- 本地优先：SQLite 快照持久化 + 启动 hydration
- 视觉：浅色默认、深色可切换、莫兰迪色系课程块、毛玻璃感卡片、顶栏安全区
- 功能：课表周视图（冲突分栏）、多课表切换、加号菜单、全部课程、课程详情/编辑/删除、设置（含课表管理）、待办列表/详情、考试作业列表/表单/详情、日历月视图、日志、导入页（Mock）

---

## 2026-04-16

### Step 0 — 规划与基线

- **小步**：确认仓库现状；锁定本迭代交付清单与依赖（expo-sqlite、expo-blur、expo-linear-gradient 等按需）。
- **验证**：`npm run typecheck`、`npm run test:domain` 基线通过后再动代码。

### Step 1 — 持久化（SQLite）

- **小步**：实现 `SqliteAppStateStorage`（单表 JSON快照 + `storageVersion`）；Web 回退内存存储。
- **验证**：类型检查；手动逻辑自检（事务写入、版本字段）。

### Step 2 — 状态与自动落盘

- **小步**：hydrate 后 `zustand` 订阅防抖持久化；暴露 `useAppStore` selectors。
- **验证**：类型检查。

### Step 3 — 主题与设计系统

- **小步**：`ThemeProvider` + `$theme.*` 映射对象；课程色板与全局 accent。
- **验证**：类型检查；关键屏在浅色/深色下可读性自检。

### Step 4 — 导航与壳

- **小步**：`SafeAreaProvider`；二级页统一顶栏（下移预留状态栏）；Tab 仅三主路由。
- **验证**：Expo Router 结构无冲突。

### Step 5 — 课表主流程

- **小步**：12 节时间轴；周课表栅格；课程块；冲突分栏；加号菜单；课表下拉切换；设置入口。
- **验证**：模拟数据 + 真数据路径；`domain` 周规则过滤一致。

### Step 6 — 课程与导入

- **小步**：手动添加课程表单校验；全部课程列表；课程详情编辑态；删除级联；导入页 Mock。
- **验证**：保存后课表/列表刷新；删除确认流。

### Step 7 — 待办 / 考试作业 / 日历 / 日志

- **小步**：列表筛选排序简化实现；关联开关；日历月格子 + 当日面板；日志秒级时间展示。
- **验证**：联动与持久化后杀进程恢复（Android优先）。

### Step 8 — 回归与提交

- **小步**：全量 `typecheck` + `test:domain`；修复 lints。
- **验证**：命令输出归档至本日志末尾「验证记录」。
- **提交**：单条或多条语义化 commit；`git push`（若远程可用）。
- **完成（2026-04-16）**：主交付 `ccef134`（`main`）已推送 → `git@github.com:cloudymount789/NJU-timetable.git`；随后 `64b0f00` 补充本日志中的提交/推送与回归验证记录。

---

## 验证记录

| 时间 (UTC 约) | 命令 | 结果 |
|----------------|------|------|
| 2026-04-15 约17:56 | `npm run typecheck` | 通过（contracts / domain / mobile） |
| 2026-04-15 约 17:56 | `npm run test:domain` | 通过（6 tests） |
| 2026-04-15 约 17:57 | `npm run typecheck` | 通过（提交后回归） |
| 2026-04-15 约 17:57 | `npm run test:domain` | 通过（6 tests，提交后回归） |

### Step 1–8 实施摘要（本轮）

- **SQLite**：`SqliteAppStateStorage` + Web 回退内存；`startPersistSubscription` 防抖落盘。
- **主题**：`AppThemeProvider` + `buildThemeTokens` / `resolveCoursePaint`（莫兰迪倾向）。
- **课表**：`TimetableScreen` 隐形栅格、12 节、周末隐藏、加号菜单、课表切换、设置入口、`expo-blur` 玻璃块。
- **业务页**：全部课程、手动添加、课程详情/提醒、设置（含课表管理）、待办列表/详情、考试作业、日志、日历（简化）、导入 Mock、功能聚合 Tab。
- **说明**：Pencil 在本环境打开超时，像素级对齐以文档与变量约定为准；后续可对照 `.pen` 微调间距与字号。
