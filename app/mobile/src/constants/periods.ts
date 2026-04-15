export interface PeriodDefinition {
  index: number;
  label: string;
  start: string;
  end: string;
}

// 与 `UI/nju-timetable.pen` 周课表节次时间一致。
export const DEFAULT_PERIODS: PeriodDefinition[] = [
  { index: 1, label: "1", start: "08:00", end: "08:50" },
  { index: 2, label: "2", start: "09:00", end: "09:50" },
  { index: 3, label: "3", start: "10:10", end: "11:00" },
  { index: 4, label: "4", start: "11:10", end: "12:00" },
  { index: 5, label: "5", start: "14:00", end: "14:50" },
  { index: 6, label: "6", start: "15:00", end: "15:50" },
  { index: 7, label: "7", start: "16:10", end: "17:00" },
  { index: 8, label: "8", start: "17:10", end: "18:00" },
  { index: 9, label: "9", start: "18:30", end: "19:20" },
  { index: 10, label: "10", start: "19:30", end: "20:20" },
  { index: 11, label: "11", start: "20:30", end: "21:20" },
  { index: 12, label: "12", start: "21:30", end: "22:20" },
];
