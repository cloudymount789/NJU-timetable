import type { LogEntry } from "@nju/contracts";
import { createId, nowIso } from "./utils";

export function createLogEntry(input: Pick<LogEntry, "title" | "body">): LogEntry {
  const now = nowIso();
  return {
    id: createId("log"),
    title: input.title,
    body: input.body,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateLogEntry(entry: LogEntry, patch: Partial<LogEntry>): LogEntry {
  const now = nowIso();
  return {
    ...entry,
    ...patch,
    updatedAt: now,
    lastEditedAt: now,
  };
}

export function deleteLogEntry(entries: LogEntry[], id: string): LogEntry[] {
  return entries.filter((entry) => entry.id !== id);
}

export function formatLogTimestampToSecond(isoTime: string): string {
  return new Date(isoTime).toLocaleString(undefined, {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
