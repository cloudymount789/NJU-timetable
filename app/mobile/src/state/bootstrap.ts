import type { AppState } from "@nju/domain";
import { createDefaultSettings, createPrimaryTimetable } from "@nju/domain";

export function createInitialAppState(): AppState {
  const primary = createPrimaryTimetable("我的课表");
  return {
    timetables: [primary],
    courses: [],
    reminders: [],
    examHomework: [],
    todos: [],
    logs: [],
    calendarMarks: [],
    settings: createDefaultSettings(),
    selectedTimetableId: primary.id,
    currentWeekIndex: 1,
  };
}
