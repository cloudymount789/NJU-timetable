import { describe, expect, it } from "vitest";
import { isCourseActiveInWeek, parseWeekRule } from "../week-rule";

describe("week-rule", () => {
  it("handles odd/even weeks", () => {
    expect(isCourseActiveInWeek(parseWeekRule({ type: "odd" }), 1)).toBe(true);
    expect(isCourseActiveInWeek(parseWeekRule({ type: "odd" }), 2)).toBe(false);
    expect(isCourseActiveInWeek(parseWeekRule({ type: "even" }), 2)).toBe(true);
  });

  it("handles specific week list", () => {
    const rule = parseWeekRule({ type: "specific", weeks: [6, 2, 10] });
    expect(rule.weeks).toEqual([2, 6, 10]);
    expect(isCourseActiveInWeek(rule, 6)).toBe(true);
    expect(isCourseActiveInWeek(rule, 7)).toBe(false);
  });
});
