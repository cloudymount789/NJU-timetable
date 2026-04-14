import { describe, expect, it } from "vitest";
import type { ExamHomework, Todo } from "@nju/contracts";
import { syncLinkedTodosFromExamHomework } from "../todo";

function makeExam(id: string, title: string): ExamHomework {
  return {
    id,
    kind: "exam",
    title,
    exam: { dateTime: "2026-04-15T08:00:00.000Z" },
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  };
}

describe("todo sync", () => {
  it("keeps manual todos and rebuilds linked todos", () => {
    const manualTodo: Todo = {
      id: "manual_1",
      title: "manual",
      kind: "plain",
      importance: 2,
      remind: false,
      progress: [],
      completed: false,
      source: "manual",
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    };

    const staleLinkedTodo: Todo = {
      id: "stale_linked",
      title: "old",
      kind: "ddl",
      importance: 2,
      remind: false,
      progress: [],
      completed: false,
      source: "exam",
      sourceId: "exam_old",
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-01T00:00:00.000Z",
    };

    const result = syncLinkedTodosFromExamHomework([makeExam("exam_1", "Math Midterm")], [manualTodo, staleLinkedTodo]);
    expect(result.filter((item) => item.source === "manual")).toHaveLength(1);
    expect(result.filter((item) => item.source !== "manual")).toHaveLength(1);
    expect(result.find((item) => item.source !== "manual")?.sourceId).toBe("exam_1");
  });
});
