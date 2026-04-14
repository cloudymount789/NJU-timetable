import type { AuditFields, EntityId } from "./common";

export type WeekRuleType = "all" | "odd" | "even" | "interval" | "specific";

export interface WeekRule {
  type: WeekRuleType;
  interval?: number;
  weeks?: number[];
}

export interface CourseMaterial {
  id: EntityId;
  name: string;
  localUri: string;
  addedAt: string;
}

export interface CourseTeacherContact {
  office?: string;
  officeHour?: string;
  email?: string;
}

export interface Course extends AuditFields {
  id: EntityId;
  timetableId: EntityId;
  title: string;
  teacher?: string;
  classroom?: string;
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startPeriod: number;
  endPeriod: number;
  weekRule: WeekRule;
  showOnGrid: boolean;
  colorToken: string;
  gradeBreakdown?: Record<string, number>;
  evaluation?: Record<string, string>;
  materials: CourseMaterial[];
  website?: string;
  teacherContact?: CourseTeacherContact;
  notes?: string;
}

export interface CourseReminder {
  courseId: EntityId;
  leadMinutes: 5 | 10 | 15 | 30;
  channels: Array<"notification" | "silent" | "vibrate" | "ringtone">;
  skipWeekendsAndHolidays: boolean;
}

export interface CourseDraftDto {
  title: string;
  teacher?: string;
  classroom?: string;
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startPeriod: number;
  endPeriod: number;
  weekRule: WeekRule;
  showOnGrid?: boolean;
  sourceMeta?: {
    parserVersion?: string;
    rawFingerprint?: string;
  };
}
