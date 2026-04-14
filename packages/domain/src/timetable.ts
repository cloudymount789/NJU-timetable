import type { Timetable } from "@nju/contracts";
import { createId, nowIso } from "./utils";

export function createPrimaryTimetable(name: string): Timetable {
  const now = nowIso();
  return {
    id: createId("tt"),
    name,
    isPrimary: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createSecondaryTimetable(name: string): Timetable {
  const now = nowIso();
  return {
    id: createId("tt"),
    name,
    isPrimary: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function renameTimetable(timetable: Timetable, name: string): Timetable {
  return {
    ...timetable,
    name,
    updatedAt: nowIso(),
  };
}

export function getPrimaryTimetable(timetables: Timetable[]): Timetable | undefined {
  return timetables.find((item) => item.isPrimary);
}

export function deleteTimetableSafely(
  timetables: Timetable[],
  targetId: string,
): { timetables: Timetable[]; deleted: boolean } {
  const target = timetables.find((item) => item.id === targetId);
  if (!target || target.isPrimary || timetables.length <= 1) {
    return { timetables, deleted: false };
  }
  return {
    timetables: timetables.filter((item) => item.id !== targetId),
    deleted: true,
  };
}
