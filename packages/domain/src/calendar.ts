import type { CalendarMark, CalendarMarkType, DateKey, Todo } from "@nju/contracts";
import { createId, nowIso } from "./utils";

export function createManualCalendarMark(
  input: Pick<CalendarMark, "dateKey" | "title" | "note"> & { type?: CalendarMarkType },
): CalendarMark {
  const now = nowIso();
  return {
    id: createId("mark"),
    dateKey: input.dateKey,
    source: "manual",
    type: input.type ?? "important",
    title: input.title,
    ...(input.note ? { note: input.note } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

export function eraseManualCalendarMark(marks: CalendarMark[], markId: string): CalendarMark[] {
  return marks.filter((mark) => !(mark.id === markId && mark.source === "manual"));
}

export function deriveCalendarFromSources(
  manualMarks: CalendarMark[],
  examMarks: CalendarMark[],
  holidayMarks: CalendarMark[],
): CalendarMark[] {
  return [...manualMarks, ...examMarks, ...holidayMarks];
}

export function resolveCalendarFillPriority(types: CalendarMarkType[]): CalendarMarkType {
  if (types.includes("important")) {
    return "important";
  }
  if (types.includes("exam")) {
    return "exam";
  }
  return "holiday";
}

export interface CalendarDaySummary {
  dateKey: DateKey;
  marks: CalendarMark[];
  todos: Todo[];
}

export function getCalendarDaySummary(
  dateKey: DateKey,
  marks: CalendarMark[],
  todos: Todo[],
): CalendarDaySummary {
  return {
    dateKey,
    marks: marks.filter((mark) => mark.dateKey === dateKey),
    todos: todos.filter((todo) => todo.dateKey === dateKey),
  };
}
