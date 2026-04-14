import type { ExamHomework, Todo } from "@nju/contracts";
import { createId, nowIso, toDateKey } from "./utils";

export function createTodo(input: Omit<Todo, "id" | "createdAt" | "updatedAt">): Todo {
  const now = nowIso();
  return {
    ...input,
    id: createId("todo"),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTodo(todo: Todo, patch: Partial<Todo>): Todo {
  return {
    ...todo,
    ...patch,
    updatedAt: nowIso(),
  };
}

export function completeTodo(todo: Todo): Todo {
  return updateTodo(todo, { completed: true });
}

export function uncompleteTodo(todo: Todo): Todo {
  return updateTodo(todo, { completed: false });
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((item) => item.id !== id);
}

export function sortTodosDefault(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.importance !== b.importance) {
      return b.importance - a.importance;
    }
    const leftDue = a.dueAt ?? a.startAt ?? "9999-12-31";
    const rightDue = b.dueAt ?? b.startAt ?? "9999-12-31";
    return leftDue > rightDue ? 1 : -1;
  });
}

export function sortTodosManual(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => (a.manualRank ?? 0) - (b.manualRank ?? 0));
}

export function reorderTodos(todos: Todo[], sourceIndex: number, targetIndex: number): Todo[] {
  const next = [...todos];
  const [moved] = next.splice(sourceIndex, 1);
  if (!moved) {
    return todos;
  }
  next.splice(targetIndex, 0, moved);
  return next.map((item, index) => ({ ...item, manualRank: index + 1 }));
}

export function filterTodosByStatus(todos: Todo[], status: "all" | "completed" | "active"): Todo[] {
  if (status === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  if (status === "active") {
    return todos.filter((todo) => !todo.completed);
  }
  return todos;
}

export function filterTodosForDay(todos: Todo[], dateKey: string): Todo[] {
  return todos.filter((todo) => {
    if (todo.dateKey) {
      return todo.dateKey === dateKey;
    }
    const sourceDate = todo.dueAt ?? todo.startAt;
    return sourceDate ? toDateKey(sourceDate) === dateKey : false;
  });
}

export function linkExamHomeworkToTodo(item: ExamHomework): Todo {
  const baseDateTime = item.exam?.dateTime ?? item.homework?.deadlines[0]?.dueAt ?? nowIso();
  return createTodo({
    title: item.title,
    kind: item.kind === "exam" ? "ddl" : "ddl",
    importance: 2,
    remind: false,
    progress: [],
    completed: item.status === "done",
    source: item.kind,
    sourceId: item.id,
    dueAt: baseDateTime,
    dateKey: toDateKey(baseDateTime),
  });
}

export function syncLinkedTodosFromExamHomework(items: ExamHomework[], todos: Todo[]): Todo[] {
  const manual = todos.filter((todo) => todo.source === "manual");
  const linked = items.map(linkExamHomeworkToTodo);
  return [...manual, ...linked];
}
