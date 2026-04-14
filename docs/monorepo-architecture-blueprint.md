# NJU Timetable Monorepo Architecture Blueprint

This blueprint is implementation-first and aligned with:
- `docs/requirements document.md`
- `docs/frontend-functional-spec.md`
- `docs/frontend-data-and-state-contract.md`
- `docs/backend-design.md`
- notes under `notes/`

## 1) Target Repository Shape

```text
app/
  mobile/                # React Native + Expo + Expo Router + TypeScript
packages/
  contracts/             # Shared types, DTO contracts, invariants
  domain/                # Pure domain logic + use-cases (no UI, no IO)
services/
  bff/                   # Optional gateway for auth/import/ocr/holiday APIs
```

## 2) Layer Responsibilities

- `app/mobile`
  - Route composition, screens, UI components, user interactions.
  - Calls domain use-cases from `@nju/domain`.
  - Never owns core business rules.
- `packages/contracts`
  - Entity definitions (`Course`, `Todo`, `ExamHomework`, ...).
  - DTOs (`CourseDraftDto`, `ImportWarnings`).
  - Shared enums/unions and normalization helpers.
- `packages/domain`
  - Deterministic pure functions.
  - Cross-module invariants and cascade behaviors.
  - No network/storage calls (adapter pattern from app side).
- `services/bff` (optional)
  - Token/session management, import/OCR proxy, holiday catalog.
  - Returns DTOs that map directly to `@nju/contracts`.

## 3) Core Domain Modules and Fine-Grained Function List

### 3.1 Timetable Module

- `createPrimaryTimetable(name)`
- `createSecondaryTimetable(name)`
- `renameTimetable(timetable, name)`
- `deleteTimetableSafely(timetables, targetId)` (must keep at least one timetable and one primary)
- `selectTimetable(timetables, targetId, fallbackPrimaryId)`
- `resetSelectionToPrimary(timetables)`
- `getPrimaryTimetable(timetables)`

### 3.2 Course Module

- `createCourseDraft(input)`
- `validateCourseForSave(input)`
- `finalizeCourseFromDraft(draft, timetableId, colorToken)`
- `updateCourse(course, patch)`
- `toggleCourseVisibility(course, showOnGrid)`
- `assignCourseColor(course, colorToken)`
- `removeCourse(courses, courseId)`
- `filterCoursesForWeek(courses, weekIndex)`
- `filterCoursesForGrid(courses, weekIndex, settings)`
- `buildCourseConflictLanes(gridCourses)`

### 3.3 Week Rule Module

- `parseWeekRule(input)`
- `isCourseActiveInWeek(weekRule, weekIndex)`
- `expandWeekRuleToSet(weekRule, maxWeek)`
- `normalizeWeekRule(weekRule)`

### 3.4 Course Detail Module

- `upsertCourseEvaluation(course, evaluation)`
- `upsertCourseGradeComposition(course, gradeComposition)`
- `appendCourseMaterial(course, material)`
- `removeCourseMaterial(course, materialId)`
- `setCourseWebsite(course, url)`
- `setTeacherContact(course, contact)`
- `setCourseNotes(course, notes)`

### 3.5 Course Reminder Module

- `createReminderDefaults(courseId)`
- `setReminderLeadMinutes(reminder, leadMinutes)`
- `toggleReminderChannel(reminder, channel)`
- `setReminderHolidaySkip(reminder, skipWeekendsAndHolidays)`
- `mergeReminderWithDefaults(reminder, defaultReminderTemplate)`

### 3.6 Exam/Homework Module

- `createExam(input)`
- `createHomework(input)`
- `updateExamHomework(item, patch)`
- `deleteExamHomework(items, id)`
- `sortExamHomework(items, sortMode)`
- `filterExamHomework(items, filterMode)`
- `deriveCalendarMarksFromExamHomework(items)`

### 3.7 Todo Module

- `createTodo(input)`
- `updateTodo(todo, patch)`
- `deleteTodo(todos, id)`
- `completeTodo(todo)`
- `uncompleteTodo(todo)`
- `sortTodosDefault(todos, now)`
- `sortTodosManual(todos)`
- `reorderTodos(todos, sourceIndex, targetIndex)`
- `filterTodosByStatus(todos, statusFilter)`
- `filterTodosForDay(todos, dateKey)`
- `linkExamHomeworkToTodo(item)`
- `syncLinkedTodosFromExamHomework(items, todos)`

### 3.8 Calendar Module

- `createManualCalendarMark(input)`
- `eraseManualCalendarMark(marks, dateKey, markId)`
- `deriveCalendarFromSources(manualMarks, examMarks, holidayMarks)`
- `getCalendarDaySummary(dateKey, marks, todos)`
- `resolveCalendarFillPriority(dayMarks)` (important > exam > holiday)

### 3.9 Log Module

- `createLogEntry(input)`
- `updateLogEntry(entry, patch)`
- `deleteLogEntry(entries, id)`
- `formatLogTimestampToSecond(isoTime)`

### 3.10 Settings Module

- `createDefaultSettings()`
- `setThemeMode(settings, mode)`
- `setFollowSystem(settings, enabled)`
- `setAccentColor(settings, colorToken)`
- `setHideWeekend(settings, enabled)`
- `setHideEmptyRows(settings, enabled)`
- `rotateCoursePalette(settings, seed)`
- `setSemesterStartDate(settings, dateIso)`
- `setLinkExamHomeworkToTodo(settings, enabled)`

### 3.11 Cross-Module Cascade Module

- `deleteCourseCascade(state, courseId)`
- `deleteExamHomeworkCascade(state, itemId)`
- `deleteTimetableCascade(state, timetableId)`
- `applyImportDraftsIntoTimetable(state, payload)`
- `rebuildDerivedCalendarAndTodoViews(state)`

## 4) State Partition in `app/mobile`

- `appState.entities`
  - `timetables`, `courses`, `courseReminders`, `examHomework`, `todos`, `logs`, `calendarMarks`
- `appState.preferences`
  - `themeMode`, `followSystem`, `accentColor`, `hideWeekend`, `hideEmptyRows`, `linkExamHomeworkToTodo`
- `appState.session`
  - `selectedTimetableId`, `currentWeekIndex`, `selectedDateKey`
- `appState.ui`
  - `isAddMenuOpen`, `screenEditMode`, `listFilter`, `listSort`, dialog states

## 5) Route Blueprint (`app/mobile`)

- Tabs:
  - `/` timetable
  - `/features` feature hub
  - `/todo` todo list
- Secondary:
  - `/import`
  - `/courses`
  - `/courses/new`
  - `/courses/[courseId]`
  - `/courses/[courseId]/reminder`
  - `/calendar`
  - `/exams`
  - `/exams/new`
  - `/exams/[itemId]`
  - `/logs`
  - `/logs/[logId]`
  - `/settings`

## 6) Contract-First Rules

- App does not invent shape outside `@nju/contracts`.
- Domain does not accept UI-only data structures.
- BFF DTOs convert into `CourseDraftDto[]` and warnings.
- All delete flows must be confirmable and mapped to cascade use-cases.

## 7) Optional BFF Scope (`services/bff`)

- `POST /v1/auth/nju/login/start`
- `POST /v1/auth/nju/login/complete`
- `POST /v1/import/jwc`
- `POST /v1/import/ocr/jobs`
- `GET /v1/import/ocr/jobs/:jobId`
- `GET /v1/catalog/holidays?region=CN&year=YYYY`

This service remains optional in phase A; local-first still applies.

