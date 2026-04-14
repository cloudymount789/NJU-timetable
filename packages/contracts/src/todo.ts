import type {
  AuditFields,
  DateKey,
  EntityId,
  ISODateTime,
  ImportanceLevel,
} from "./common";

export type TodoKind = "duration" | "ddl" | "plain";

export interface TodoProgressEntry {
  at: ISODateTime;
  text: string;
}

export interface Todo extends AuditFields {
  id: EntityId;
  title: string;
  body?: string;
  place?: string;
  kind: TodoKind;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  dueAt?: ISODateTime;
  importance: ImportanceLevel;
  remind: boolean;
  remindAt?: ISODateTime;
  progress: TodoProgressEntry[];
  accent?: string;
  completed: boolean;
  manualRank?: number;
  source: "manual" | "exam" | "homework";
  sourceId?: EntityId;
  dateKey?: DateKey;
}
