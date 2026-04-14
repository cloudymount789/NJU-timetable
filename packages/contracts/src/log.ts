import type { AuditFields, EntityId, ISODateTime } from "./common";

export interface LogEntry extends AuditFields {
  id: EntityId;
  title: string;
  body: string;
  lastEditedAt?: ISODateTime;
}
