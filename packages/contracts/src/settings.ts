import type { ThemeMode } from "./common";

export interface AppSettings {
  themeMode: ThemeMode;
  followSystem: boolean;
  accentColor: string;
  hideWeekend: boolean;
  hideEmptyRows: boolean;
  semesterStartDate: string;
  linkExamHomeworkToTodo: boolean;
  coursePaletteSeed: number;
}
