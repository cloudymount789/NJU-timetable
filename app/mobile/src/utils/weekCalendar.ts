/** Helpers for teaching-week day strip (aligned with `02 Week Timetable` in Pencil). */

export function parseLocalDateFromIso(iso: string): Date {
  const part = iso.slice(0, 10);
  const parts = part.split("-").map((x) => Number(x));
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d);
}

export function mondayOfWeekContaining(d: Date): Date {
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset);
  m.setHours(0, 0, 0, 0);
  return m;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Week 1 starts on the Monday of the week that contains `semesterStartIso` (date-only). */
export function getTeachingWeekDays(semesterStartIso: string, weekIndex: number): Date[] {
  const baseMonday = mondayOfWeekContaining(parseLocalDateFromIso(semesterStartIso));
  const start = addDays(baseMonday, (weekIndex - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** 1 = Monday … 7 = Sunday */
export function weekdayIndexMonFirst(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

export function formatMonthNum(d: Date): string {
  return `${d.getMonth() + 1}月`;
}

export function formatSlashDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}/${day}`;
}
