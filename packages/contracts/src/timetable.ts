import type { AuditFields, EntityId } from "./common";

export interface Timetable extends AuditFields {
  id: EntityId;
  name: string;
  isPrimary: boolean;
}
