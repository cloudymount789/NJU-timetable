import type { AppSettings, ThemeMode } from "@nju/contracts";
import { rotatePaletteSeed } from "./palette";

export function createDefaultSettings(): AppSettings {
  return {
    themeMode: "light",
    followSystem: false,
    accentColor: "#ff6347",
    hideWeekend: false,
    hideEmptyRows: false,
    semesterStartDate: new Date().toISOString(),
    linkExamHomeworkToTodo: false,
    coursePaletteSeed: 1,
  };
}

export function setThemeMode(settings: AppSettings, mode: ThemeMode): AppSettings {
  return { ...settings, themeMode: mode };
}

export function setFollowSystem(settings: AppSettings, enabled: boolean): AppSettings {
  return { ...settings, followSystem: enabled };
}

export function setAccentColor(settings: AppSettings, accentColor: string): AppSettings {
  return { ...settings, accentColor };
}

export function setHideWeekend(settings: AppSettings, hideWeekend: boolean): AppSettings {
  return { ...settings, hideWeekend };
}

export function setHideEmptyRows(settings: AppSettings, hideEmptyRows: boolean): AppSettings {
  return { ...settings, hideEmptyRows };
}

export function setSemesterStartDate(settings: AppSettings, semesterStartDate: string): AppSettings {
  return { ...settings, semesterStartDate };
}

export function setLinkExamHomeworkToTodo(
  settings: AppSettings,
  linkExamHomeworkToTodo: boolean,
): AppSettings {
  return { ...settings, linkExamHomeworkToTodo };
}

export function rotateCoursePalette(settings: AppSettings): AppSettings {
  return { ...settings, coursePaletteSeed: rotatePaletteSeed(settings.coursePaletteSeed) };
}
