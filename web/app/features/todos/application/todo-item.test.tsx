import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { createPopulatedTodo } from "../infrastructure/todos-factories.server"
import { TodoItemComponent } from "./todo-item"
import { render, screen, userEvent } from "~/test/react-test-utils"

describe("TodoItemComponent", () => {
  test("given: an incomplete todo, should: render the title without line-through", () => {
    const todo = createPopulatedTodo({ completed: false, title: "Buy milk" })
    const path = "/"
    const RouterStub = createRoutesStub([
      { Component: () => <TodoItemComponent todo={todo} />, path },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByText("Buy milk")).toBeInTheDocument()
    expect(screen.getByText("Buy milk")).toHaveAttribute(
      "data-completed",
      "false",
    )
  })

  test("given: a completed todo, should: render the title with line-through", () => {
    const todo = createPopulatedTodo({
      completed: true,
      title: "Done task",
    })
    const path = "/"
    const RouterStub = createRoutesStub([
      { Component: () => <TodoItemComponent todo={todo} />, path },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByText("Done task")).toHaveAttribute(
      "data-completed",
      "true",
    )
  })

  test("given: a todo, should: render toggle, edit, and delete buttons", () => {
    const todo = createPopulatedTodo({ title: "Test todo" })
    const path = "/"
    const RouterStub = createRoutesStub([
      { Component: () => <TodoItemComponent todo={todo} />, path },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(
      screen.getByRole("button", { name: /toggle test todo/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /edit test todo/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /delete test todo/i }),
    ).toBeInTheDocument()
  })

  test("given: a todo with description, should: render the description", () => {
    const todo = createPopulatedTodo({
      description: "Get whole milk",
      title: "Buy milk",
    })
    const path = "/"
    const RouterStub = createRoutesStub([
      { Component: () => <TodoItemComponent todo={todo} />, path },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByText("Get whole milk")).toBeInTheDocument()
  })

  test("given: clicking edit button, should: show edit form", async () => {
    const user = userEvent.setup()
    const todo = createPopulatedTodo({ title: "Edit me" })
    const path = "/"
    const RouterStub = createRoutesStub([
      { Component: () => <TodoItemComponent todo={todo} />, path },
    ])

    render(<RouterStub initialEntries={[path]} />)

    await user.click(screen.getByRole("button", { name: /edit edit me/i }))

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  test("given: clicking cancel in edit mode, should: return to display mode", async () => {
    const user = userEvent.setup()
    const todo = createPopulatedTodo({ title: "Cancel me" })
    const path = "/"
    const RouterStub = createRoutesStub([
      { Component: () => <TodoItemComponent todo={todo} />, path },
    ])

    render(<RouterStub initialEntries={[path]} />)

    await user.click(screen.getByRole("button", { name: /edit cancel me/i }))
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(
      screen.getByRole("button", { name: /edit cancel me/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /save/i }),
    ).not.toBeInTheDocument()
  })
})
