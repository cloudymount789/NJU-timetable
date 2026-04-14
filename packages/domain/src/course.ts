import type { Course, CourseDraftDto } from "@nju/contracts";
import { createId, nowIso } from "./utils";
import { isCourseActiveInWeek } from "./week-rule";

export interface CourseSaveValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCourseForSave(input: CourseDraftDto): CourseSaveValidationResult {
  const errors: string[] = [];
  if (!input.title?.trim()) {
    errors.push("Course title is required.");
  }
  if (input.startPeriod <= 0 || input.endPeriod < input.startPeriod) {
    errors.push("Period range is invalid.");
  }
  return { ok: errors.length === 0, errors };
}

export function finalizeCourseFromDraft(
  draft: CourseDraftDto,
  timetableId: string,
  colorToken: string,
): Course {
  const now = nowIso();
  return {
    id: createId("course"),
    timetableId,
    title: draft.title,
    ...(draft.teacher ? { teacher: draft.teacher } : {}),
    ...(draft.classroom ? { classroom: draft.classroom } : {}),
    weekday: draft.weekday,
    startPeriod: draft.startPeriod,
    endPeriod: draft.endPeriod,
    weekRule: draft.weekRule,
    showOnGrid: draft.showOnGrid ?? true,
    colorToken,
    materials: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCourse(course: Course, patch: Partial<Course>): Course {
  return {
    ...course,
    ...patch,
    updatedAt: nowIso(),
  };
}

export function removeCourse(courses: Course[], courseId: string): Course[] {
  return courses.filter((course) => course.id !== courseId);
}

export function filterCoursesForWeek(courses: Course[], weekIndex: number): Course[] {
  return courses.filter((course) => isCourseActiveInWeek(course.weekRule, weekIndex));
}

export function filterCoursesForGrid(courses: Course[], weekIndex: number): Course[] {
  return filterCoursesForWeek(courses, weekIndex).filter((course) => course.showOnGrid);
}

export function buildCourseConflictLanes(courses: Course[]): Array<Course[]> {
  const sorted = [...courses].sort((a, b) => a.startPeriod - b.startPeriod);
  const lanes: Array<Course[]> = [];
  sorted.forEach((course) => {
    const lane = lanes.find((group) => {
      const tail = group[group.length - 1];
      return tail ? tail.endPeriod < course.startPeriod : false;
    });
    if (lane) {
      lane.push(course);
    } else {
      lanes.push([course]);
    }
  });
  return lanes;
}
