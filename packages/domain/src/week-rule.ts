import type { WeekRule } from "@nju/contracts";

export function parseWeekRule(input: Partial<WeekRule>): WeekRule {
  if (input.type === "specific") {
    return {
      type: "specific",
      weeks: [...(input.weeks ?? [])].sort((a, b) => a - b),
    };
  }
  if (input.type === "interval") {
    return {
      type: "interval",
      interval: Math.max(1, input.interval ?? 2),
    };
  }
  if (input.type === "odd" || input.type === "even" || input.type === "all") {
    return { type: input.type };
  }
  return { type: "all" };
}

export function isCourseActiveInWeek(weekRule: WeekRule, weekIndex: number): boolean {
  if (weekRule.type === "all") {
    return true;
  }
  if (weekRule.type === "odd") {
    return weekIndex % 2 === 1;
  }
  if (weekRule.type === "even") {
    return weekIndex % 2 === 0;
  }
  if (weekRule.type === "interval") {
    const interval = Math.max(1, weekRule.interval ?? 2);
    return (weekIndex - 1) % interval === 0;
  }
  if (weekRule.type === "specific") {
    return (weekRule.weeks ?? []).includes(weekIndex);
  }
  return true;
}

export function expandWeekRuleToSet(weekRule: WeekRule, maxWeek: number): Set<number> {
  const weeks = new Set<number>();
  for (let week = 1; week <= maxWeek; week += 1) {
    if (isCourseActiveInWeek(weekRule, week)) {
      weeks.add(week);
    }
  }
  return weeks;
}
