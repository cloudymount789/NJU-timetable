import type {
  AppSettings,
  Course,
  CourseDraftDto,
  CourseReminder,
  ExamHomework,
  WeekRule,
} from "@nju/contracts";
import {
  createExam,
  createHomework,
  createLogEntry,
  createManualCalendarMark,
  createReminderDefaults,
  createSecondaryTimetable,
  createTodo,
  deleteCourseCascade,
  deleteExamHomeworkCascade,
  deleteLogEntry,
  deleteTimetableCascade,
  deleteTodo,
  eraseManualCalendarMark,
  finalizeCourseFromDraft,
  pickCourseColor,
  parseWeekRule,
  rotateCoursePalette,
  setAccentColor,
  setFollowSystem,
  setHideEmptyRows,
  setHideWeekend,
  setLinkExamHomeworkToTodo,
  setSemesterStartDate,
  setThemeMode,
  syncLinkedTodosFromExamHomework,
  updateCourse,
  updateExamHomework,
  updateLogEntry,
  updateTodo,
  validateCourseForSave,
} from "@nju/domain";
import { useAppStore } from "./store";

export interface SaveCourseFormInput {
  timetableId: string;
  title: string;
  teacher?: string;
  classroom?: string;
  weekday: Course["weekday"];
  startPeriod: number;
  endPeriod: number;
  weekRule: WeekRule;
  showOnGrid: boolean;
}

export function saveNewCourse(input: SaveCourseFormInput): { ok: true } | { ok: false; errors: string[] } {
  const draft: CourseDraftDto = {
    title: input.title.trim(),
    weekday: input.weekday,
    startPeriod: input.startPeriod,
    endPeriod: input.endPeriod,
    weekRule: parseWeekRule(input.weekRule),
    showOnGrid: input.showOnGrid,
    ...(input.teacher?.trim() ? { teacher: input.teacher.trim() } : {}),
    ...(input.classroom?.trim() ? { classroom: input.classroom.trim() } : {}),
  };

  if (!input.showOnGrid) {
    if (!draft.title) {
      return { ok: false, errors: ["课程名称必填"] };
    }
    useAppStore.getState().updateState((state) => {
      const seed = state.settings.coursePaletteSeed;
      const nextIndex = state.courses.filter((c) => c.timetableId === input.timetableId).length;
      const color = pickCourseColor(seed, nextIndex);
      const course = finalizeCourseFromDraft(
        {
          ...draft,
          startPeriod: 1,
          endPeriod: 1,
          weekday: 1,
          weekRule: parseWeekRule({ type: "all" }),
        },
        input.timetableId,
        color,
      );
      const adjusted: Course = {
        ...course,
        weekday: input.weekday,
        startPeriod: input.startPeriod,
        endPeriod: input.endPeriod,
        weekRule: parseWeekRule(input.weekRule),
        showOnGrid: false,
        ...(input.teacher?.trim() ? { teacher: input.teacher.trim() } : {}),
        ...(input.classroom?.trim() ? { classroom: input.classroom.trim() } : {}),
      };
      const hasReminder = state.reminders.some((r) => r.courseId === adjusted.id);
      return {
        ...state,
        courses: [...state.courses, adjusted],
        reminders: hasReminder ? state.reminders : [...state.reminders, createReminderDefaults(adjusted.id)],
      };
    });
    return { ok: true };
  }

  const validation = validateCourseForSave(draft);
  if (!validation.ok) {
    return { ok: false, errors: validation.errors };
  }

  useAppStore.getState().updateState((state) => {
    const seed = state.settings.coursePaletteSeed;
    const nextIndex = state.courses.filter((c) => c.timetableId === input.timetableId).length;
    const color = pickCourseColor(seed, nextIndex);
    const course = finalizeCourseFromDraft(draft, input.timetableId, color);
    const hasReminder = state.reminders.some((r) => r.courseId === course.id);
    return {
      ...state,
      courses: [...state.courses, course],
      reminders: hasReminder ? state.reminders : [...state.reminders, createReminderDefaults(course.id)],
    };
  });

  return { ok: true };
}

export function patchCourse(courseId: string, patch: Partial<Course>): void {
  useAppStore.getState().updateState((state) => {
    const target = state.courses.find((c) => c.id === courseId);
    if (!target) {
      return state;
    }
    return {
      ...state,
      courses: state.courses.map((c) => (c.id === courseId ? updateCourse(c, patch) : c)),
    };
  });
}

export function removeCourse(courseId: string): void {
  useAppStore.getState().updateState((state) => deleteCourseCascade(state, courseId));
}

export function addSecondaryTimetable(name: string): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    timetables: [...state.timetables, createSecondaryTimetable(name)],
  }));
}

export function selectTimetable(timetableId: string): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    selectedTimetableId: timetableId,
  }));
}

export function setCurrentWeekIndex(weekIndex: number): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    currentWeekIndex: weekIndex,
  }));
}

export function deleteNonPrimaryTimetable(timetableId: string): boolean {
  let deleted = false;
  useAppStore.getState().updateState((state) => {
    const next = deleteTimetableCascade(state, timetableId);
    if (next === state) {
      return state;
    }
    deleted = true;
    return next;
  });
  return deleted;
}

export function patchAppSettings(recipe: (settings: AppSettings) => AppSettings): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    settings: recipe(state.settings),
  }));
}

export function setTheme(mode: AppSettings["themeMode"]): void {
  patchAppSettings((s) => setThemeMode(s, mode));
}

export function setFollowSystemFlag(enabled: boolean): void {
  patchAppSettings((s) => setFollowSystem(s, enabled));
}

export function setAccent(hex: string): void {
  patchAppSettings((s) => setAccentColor(s, hex));
}

export function setHideWeekendFlag(enabled: boolean): void {
  patchAppSettings((s) => setHideWeekend(s, enabled));
}

export function setHideEmptyRowsFlag(enabled: boolean): void {
  patchAppSettings((s) => setHideEmptyRows(s, enabled));
}

export function setSemesterStart(isoDate: string): void {
  patchAppSettings((s) => setSemesterStartDate(s, isoDate));
}

export function randomizeCourseColors(): void {
  useAppStore.getState().updateState((state) => {
    const settings = rotateCoursePalette(state.settings);
    const nextCourses = state.courses.map((course, index) =>
      updateCourse(course, { colorToken: pickCourseColor(settings.coursePaletteSeed, index) }),
    );
    return { ...state, settings, courses: nextCourses };
  });
}

export function setLinkExamHomeworkToTodoFlag(enabled: boolean): void {
  useAppStore.getState().updateState((state) => {
    const settings = setLinkExamHomeworkToTodo(state.settings, enabled);
    const todos = enabled
      ? syncLinkedTodosFromExamHomework(state.examHomework, state.todos)
      : state.todos.filter((t) => t.source === "manual");
    return { ...state, settings, todos };
  });
}

export function addExam(item: Omit<ExamHomework, "id" | "createdAt" | "updatedAt" | "kind">): void {
  useAppStore.getState().updateState((state) => {
    const nextItem = createExam(item);
    let todos = state.todos;
    if (state.settings.linkExamHomeworkToTodo) {
      todos = syncLinkedTodosFromExamHomework([...state.examHomework, nextItem], state.todos);
    }
    return { ...state, examHomework: [...state.examHomework, nextItem], todos };
  });
}

export function addHomework(item: Omit<ExamHomework, "id" | "createdAt" | "updatedAt" | "kind">): void {
  useAppStore.getState().updateState((state) => {
    const nextItem = createHomework(item);
    let todos = state.todos;
    if (state.settings.linkExamHomeworkToTodo) {
      todos = syncLinkedTodosFromExamHomework([...state.examHomework, nextItem], state.todos);
    }
    return { ...state, examHomework: [...state.examHomework, nextItem], todos };
  });
}

export function patchExamHomework(id: string, patch: Partial<ExamHomework>): void {
  useAppStore.getState().updateState((state) => {
    const next = state.examHomework.map((item) => (item.id === id ? updateExamHomework(item, patch) : item));
    const todos = state.settings.linkExamHomeworkToTodo
      ? syncLinkedTodosFromExamHomework(next, state.todos.filter((t) => t.source === "manual"))
      : state.todos;
    return { ...state, examHomework: next, todos };
  });
}

export function removeExamHomework(id: string): void {
  useAppStore.getState().updateState((state) => deleteExamHomeworkCascade(state, id));
}

export function addTodo(
  input: Omit<import("@nju/contracts").Todo, "id" | "createdAt" | "updatedAt">,
): string {
  let id = "";
  useAppStore.getState().updateState((state) => {
    const todo = createTodo(input);
    id = todo.id;
    return { ...state, todos: [...state.todos, todo] };
  });
  return id;
}

export function patchTodo(id: string, patch: Partial<import("@nju/contracts").Todo>): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    todos: state.todos.map((t) => (t.id === id ? updateTodo(t, patch) : t)),
  }));
}

export function removeTodo(id: string): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    todos: deleteTodo(state.todos, id),
  }));
}

export function addLog(title: string, body: string): string {
  let id = "";
  useAppStore.getState().updateState((state) => {
    const entry = createLogEntry({ title, body });
    id = entry.id;
    return { ...state, logs: [entry, ...state.logs] };
  });
  return id;
}

export function patchLog(id: string, patch: Partial<import("@nju/contracts").LogEntry>): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    logs: state.logs.map((l) => (l.id === id ? updateLogEntry(l, patch) : l)),
  }));
}

export function removeLog(id: string): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    logs: deleteLogEntry(state.logs, id),
  }));
}

export function addImportantDay(input: { dateKey: string; title: string; note?: string }): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    calendarMarks: [...state.calendarMarks, createManualCalendarMark(input)],
  }));
}

export function removeManualCalendarMark(markId: string): void {
  useAppStore.getState().updateState((state) => ({
    ...state,
    calendarMarks: eraseManualCalendarMark(state.calendarMarks, markId),
  }));
}

export function upsertReminder(courseId: string, patch: Partial<CourseReminder>): void {
  useAppStore.getState().updateState((state) => {
    const existing = state.reminders.find((r) => r.courseId === courseId);
    const base = existing ?? createReminderDefaults(courseId);
    const next: CourseReminder = { ...base, ...patch, courseId };
    const reminders = existing
      ? state.reminders.map((r) => (r.courseId === courseId ? next : r))
      : [...state.reminders, next];
    return { ...state, reminders };
  });
}
