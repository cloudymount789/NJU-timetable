import type { AuditFields, DateKey, EntityId } from "./common";

export type CalendarMarkType = "important" | "exam" | "holiday";
export type CalendarMarkSource = "manual" | "exam" | "holiday";

export interface CalendarMark extends AuditFields {
  id: EntityId;
  dateKey: DateKey;
  type: CalendarMarkType;
  source: CalendarMarkSource;
  title: string;
  note?: string;
}
