import type {
  AppSettings,
  CalendarMark,
  Course,
  CourseReminder,
  ExamHomework,
  LogEntry,
  Timetable,
  Todo,
} from "@nju/contracts";

export interface AppState {
  timetables: Timetable[];
  courses: Course[];
  reminders: CourseReminder[];
  examHomework: ExamHomework[];
  todos: Todo[];
  logs: LogEntry[];
  calendarMarks: CalendarMark[];
  settings: AppSettings;
  selectedTimetableId: string;
  currentWeekIndex: number;
}
