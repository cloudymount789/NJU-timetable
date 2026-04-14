import { describe, expect, it } from "vitest";
import { createPrimaryTimetable, createSecondaryTimetable, deleteTimetableSafely } from "../timetable";

describe("timetable", () => {
  it("cannot delete primary timetable", () => {
    const primary = createPrimaryTimetable("Main");
    const secondary = createSecondaryTimetable("A");
    const result = deleteTimetableSafely([primary, secondary], primary.id);
    expect(result.deleted).toBe(false);
    expect(result.timetables).toHaveLength(2);
  });

  it("cannot delete the last timetable", () => {
    const primary = createPrimaryTimetable("Main");
    const result = deleteTimetableSafely([primary], primary.id);
    expect(result.deleted).toBe(false);
    expect(result.timetables).toHaveLength(1);
  });

  it("deletes non-primary timetable", () => {
    const primary = createPrimaryTimetable("Main");
    const secondary = createSecondaryTimetable("A");
    const result = deleteTimetableSafely([primary, secondary], secondary.id);
    expect(result.deleted).toBe(true);
    expect(result.timetables).toHaveLength(1);
    expect(result.timetables[0]?.id).toBe(primary.id);
  });
});
