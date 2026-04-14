export type EntityId = string;
export type ISODateTime = string;
export type DateKey = string; // YYYY-MM-DD in local timezone

export type ThemeMode = "light" | "dark" | "system";
export type ImportanceLevel = 1 | 2 | 3;

export interface AuditFields {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
