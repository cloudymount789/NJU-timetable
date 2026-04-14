import type { DateKey, ExamHomework } from "@nju/contracts";
import { createId, nowIso, toDateKey } from "./utils";

export function createExam(input: Omit<ExamHomework, "id" | "createdAt" | "updatedAt" | "kind">): ExamHomework {
  const now = nowIso();
  return {
    ...input,
    id: createId("exam"),
    kind: "exam",
    createdAt: now,
    updatedAt: now,
  };
}

export function createHomework(
  input: Omit<ExamHomework, "id" | "createdAt" | "updatedAt" | "kind">,
): ExamHomework {
  const now = nowIso();
  return {
    ...input,
    id: createId("hw"),
    kind: "homework",
    createdAt: now,
    updatedAt: now,
  };
}

export function updateExamHomework(item: ExamHomework, patch: Partial<ExamHomework>): ExamHomework {
  return { ...item, ...patch, updatedAt: nowIso() };
}

export function deleteExamHomework(items: ExamHomework[], id: string): ExamHomework[] {
  return items.filter((item) => item.id !== id);
}

export function sortExamHomework(items: ExamHomework[]): ExamHomework[] {
  return [...items].sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
}

export function deriveExamDateKeys(items: ExamHomework[]): DateKey[] {
  return items
    .filter((item) => item.kind === "exam" && item.exam?.dateTime)
    .map((item) => toDateKey(item.exam!.dateTime));
}
