import { describe, expect, test } from "vitest"

import type { Todo } from "./todos-domain"
import {
  countByStatus,
  extractCompletedIds,
  filterTodos,
  parseTodoFilter,
  toggleCompleted,
  validateNewTodo,
  validateTodoDescription,
  validateTodoTitle,
  validateTodoUpdate,
  validationErrorToMessage,
} from "./todos-domain"

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  completed: false,
  createdAt: new Date("2024-01-01"),
  description: "",
  id: "test-id",
  title: "Test todo",
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

describe("validateTodoTitle()", () => {
  test("given: a valid title, should: return trimmed title", () => {
    const result = validateTodoTitle("  Buy groceries  ")

    expect(result).toEqual({ data: "Buy groceries", success: true })
  })

  test("given: an empty title, should: return TITLE_EMPTY error", () => {
    const result = validateTodoTitle("   ")

    expect(result).toEqual({ error: "TITLE_EMPTY", success: false })
  })

  test("given: a title exceeding max length, should: return TITLE_TOO_LONG error", () => {
    const longTitle = "a".repeat(201)
    const result = validateTodoTitle(longTitle)

    expect(result).toEqual({ error: "TITLE_TOO_LONG", success: false })
  })
})

describe("validateTodoDescription()", () => {
  test("given: a valid description, should: return trimmed description", () => {
    const result = validateTodoDescription("  Some details  ")

    expect(result).toEqual({ data: "Some details", success: true })
  })

  test("given: a description exceeding max length, should: return DESCRIPTION_TOO_LONG error", () => {
    const longDescription = "a".repeat(1001)
    const result = validateTodoDescription(longDescription)

    expect(result).toEqual({
      error: "DESCRIPTION_TOO_LONG",
      success: false,
    })
  })

  test("given: an empty description, should: return empty string as valid", () => {
    const result = validateTodoDescription("")

    expect(result).toEqual({ data: "", success: true })
  })
})

describe("validateNewTodo()", () => {
  test("given: valid title and description, should: return trimmed values", () => {
    const result = validateNewTodo({
      description: "  Some details  ",
      title: "  Buy groceries  ",
    })

    expect(result).toEqual({
      data: { description: "Some details", title: "Buy groceries" },
      success: true,
    })
  })

  test("given: an empty title, should: return TITLE_EMPTY error", () => {
    const result = validateNewTodo({ description: "Details", title: "   " })

    expect(result).toEqual({ error: "TITLE_EMPTY", success: false })
  })

  test("given: a description exceeding max length, should: return DESCRIPTION_TOO_LONG error", () => {
    const result = validateNewTodo({
      description: "a".repeat(1001),
      title: "Valid",
    })

    expect(result).toEqual({
      error: "DESCRIPTION_TOO_LONG",
      success: false,
    })
  })
})

describe("validationErrorToMessage()", () => {
  test("given: TITLE_EMPTY, should: return title required message", () => {
    expect(validationErrorToMessage("TITLE_EMPTY")).toBe("Title is required")
  })

  test("given: TITLE_TOO_LONG, should: return title length message", () => {
    expect(validationErrorToMessage("TITLE_TOO_LONG")).toBe(
      "Title must be 200 characters or less",
    )
  })

  test("given: DESCRIPTION_TOO_LONG, should: return description length message", () => {
    expect(validationErrorToMessage("DESCRIPTION_TOO_LONG")).toBe(
      "Description must be 1000 characters or less",
    )
  })
})

describe("toggleCompleted()", () => {
  test("given: false, should: return true", () => {
    expect(toggleCompleted(false)).toBe(true)
  })

  test("given: true, should: return false", () => {
    expect(toggleCompleted(true)).toBe(false)
  })
})

describe("parseTodoFilter()", () => {
  test("given: 'active', should: return 'active'", () => {
    expect(parseTodoFilter("active")).toBe("active")
  })

  test("given: 'completed', should: return 'completed'", () => {
    expect(parseTodoFilter("completed")).toBe("completed")
  })

  test("given: 'all', should: return 'all'", () => {
    expect(parseTodoFilter("all")).toBe("all")
  })

  test("given: null, should: return 'all'", () => {
    expect(parseTodoFilter(null)).toBe("all")
  })

  test("given: 'invalid', should: return 'all'", () => {
    expect(parseTodoFilter("invalid")).toBe("all")
  })
})

describe("filterTodos()", () => {
  const todos: Todo[] = [
    createTodo({ completed: false, id: "1", title: "Active" }),
    createTodo({ completed: true, id: "2", title: "Done" }),
    createTodo({ completed: false, id: "3", title: "Also active" }),
  ]

  test("given: filter 'all', should: return all todos", () => {
    expect(filterTodos(todos, "all")).toHaveLength(3)
  })

  test("given: filter 'active', should: return only incomplete todos", () => {
    const result = filterTodos(todos, "active")

    expect(result).toHaveLength(2)
    expect(result.every((t) => !t.completed)).toBe(true)
  })

  test("given: filter 'completed', should: return only completed todos", () => {
    const result = filterTodos(todos, "completed")

    expect(result).toHaveLength(1)
    expect(result[0]?.title).toBe("Done")
  })
})

describe("countByStatus()", () => {
  test("given: a mixed list, should: return correct counts", () => {
    const todos: Todo[] = [
      createTodo({ completed: false, id: "1" }),
      createTodo({ completed: true, id: "2" }),
      createTodo({ completed: false, id: "3" }),
    ]

    expect(countByStatus(todos)).toEqual({
      active: 2,
      completed: 1,
      total: 3,
    })
  })

  test("given: an empty list, should: return all zeros", () => {
    expect(countByStatus([])).toEqual({
      active: 0,
      completed: 0,
      total: 0,
    })
  })
})

describe("extractCompletedIds()", () => {
  test("given: a mixed list, should: return only completed IDs", () => {
    const todos: Todo[] = [
      createTodo({ completed: false, id: "1" }),
      createTodo({ completed: true, id: "2" }),
      createTodo({ completed: true, id: "3" }),
    ]

    expect(extractCompletedIds(todos)).toEqual(["2", "3"])
  })

  test("given: no completed todos, should: return empty array", () => {
    const todos: Todo[] = [
      createTodo({ completed: false, id: "1" }),
      createTodo({ completed: false, id: "2" }),
    ]

    expect(extractCompletedIds(todos)).toEqual([])
  })

  test("given: all completed todos, should: return all IDs", () => {
    const todos: Todo[] = [
      createTodo({ completed: true, id: "1" }),
      createTodo({ completed: true, id: "2" }),
    ]

    expect(extractCompletedIds(todos)).toEqual(["1", "2"])
  })
})

describe("validateTodoUpdate()", () => {
  test("given: valid title and description, should: return trimmed values", () => {
    const result = validateTodoUpdate({
      description: "  Updated details  ",
      title: "  Updated title  ",
    })

    expect(result).toEqual({
      data: { description: "Updated details", title: "Updated title" },
      success: true,
    })
  })

  test("given: empty title, should: return TITLE_EMPTY error", () => {
    const result = validateTodoUpdate({ description: "Details", title: "   " })

    expect(result).toEqual({ error: "TITLE_EMPTY", success: false })
  })

  test("given: title exceeding max length, should: return TITLE_TOO_LONG error", () => {
    const result = validateTodoUpdate({
      description: "",
      title: "a".repeat(201),
    })

    expect(result).toEqual({ error: "TITLE_TOO_LONG", success: false })
  })

  test("given: description exceeding max length, should: return DESCRIPTION_TOO_LONG error", () => {
    const result = validateTodoUpdate({
      description: "a".repeat(1001),
      title: "Valid",
    })

    expect(result).toEqual({
      error: "DESCRIPTION_TOO_LONG",
      success: false,
    })
  })
})
