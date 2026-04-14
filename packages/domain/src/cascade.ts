import type { AppState } from "./app-state";
import { removeCourse } from "./course";
import { deleteExamHomework } from "./exam-homework";
import { deriveCalendarFromSources } from "./calendar";
import { deleteTimetableSafely, getPrimaryTimetable } from "./timetable";
import { syncLinkedTodosFromExamHomework } from "./todo";

export function deleteCourseCascade(state: AppState, courseId: string): AppState {
  const nextCourses = removeCourse(state.courses, courseId);
  const nextReminders = state.reminders.filter((item) => item.courseId !== courseId);
  const nextExamHomework = state.examHomework.filter((item) => item.courseId !== courseId);
  const nextTodos = state.todos.filter((todo) => !(todo.source !== "manual" && todo.sourceId === courseId));
  return {
    ...state,
    courses: nextCourses,
    reminders: nextReminders,
    examHomework: nextExamHomework,
    todos: nextTodos,
  };
}

export function deleteExamHomeworkCascade(state: AppState, itemId: string): AppState {
  const nextExamHomework = deleteExamHomework(state.examHomework, itemId);
  const nextTodos = state.todos.filter((todo) => todo.sourceId !== itemId);
  return {
    ...state,
    examHomework: nextExamHomework,
    todos: nextTodos,
  };
}

export function deleteTimetableCascade(state: AppState, timetableId: string): AppState {
  const result = deleteTimetableSafely(state.timetables, timetableId);
  if (!result.deleted) {
    return state;
  }
  const removedCourseIds = new Set(
    state.courses.filter((course) => course.timetableId === timetableId).map((course) => course.id),
  );
  const nextCourses = state.courses.filter((course) => course.timetableId !== timetableId);
  const nextExamHomework = state.examHomework.filter((item) => !removedCourseIds.has(item.courseId ?? ""));
  const nextReminders = state.reminders.filter((item) => !removedCourseIds.has(item.courseId));
  const primary = getPrimaryTimetable(result.timetables);
  return {
    ...state,
    timetables: result.timetables,
    courses: nextCourses,
    reminders: nextReminders,
    examHomework: nextExamHomework,
    selectedTimetableId: primary?.id ?? state.selectedTimetableId,
  };
}

export function rebuildDerivedCalendarAndTodoViews(state: AppState): AppState {
  const nextTodos = state.settings.linkExamHomeworkToTodo
    ? syncLinkedTodosFromExamHomework(state.examHomework, state.todos)
    : state.todos;
  return {
    ...state,
    todos: nextTodos,
    calendarMarks: deriveCalendarFromSources(state.calendarMarks, [], []),
  };
}
