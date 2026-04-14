import type { AuditFields, EntityId, ISODateTime } from "./common";

export type ExamHomeworkKind = "exam" | "homework";

export interface HomeworkDeadline {
  weekday?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  dueAt?: ISODateTime;
}

export interface ExamHomework extends AuditFields {
  id: EntityId;
  kind: ExamHomeworkKind;
  title: string;
  courseId?: EntityId;
  exam?: {
    dateTime: ISODateTime;
    location?: string;
    examType?: string;
    note?: string;
  };
  homework?: {
    deadlines: HomeworkDeadline[];
    relatedContent?: string;
    repeat?: boolean;
  };
  status?: "open" | "done";
}
