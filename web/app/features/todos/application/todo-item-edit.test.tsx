import { createRoutesStub } from "react-router"
import { describe, expect, test, vi } from "vitest"

import { createPopulatedTodo } from "../infrastructure/todos-factories.server"
import { TodoItemEditComponent } from "./todo-item-edit"
import { render, screen } from "~/test/react-test-utils"

const createMockFetcher = () =>
  ({
    data: undefined,
    Form: "form",
    formAction: undefined,
    formData: undefined,
    formEncType: undefined,
    formMethod: undefined,
    json: undefined,
    key: "",
    load: vi.fn(),
    state: "idle",
    submit: vi.fn(),
    text: undefined,
  }) as never

describe("TodoItemEditComponent", () => {
  test("given: a todo, should: prefill form with current values", () => {
    const todo = createPopulatedTodo({
      description: "Get whole milk",
      title: "Buy milk",
    })
    const path = "/"
    const RouterStub = createRoutesStub([
      {
        Component: () => (
          <TodoItemEditComponent
            fetcher={createMockFetcher()}
            onCancel={vi.fn()}
            todo={todo}
          />
        ),
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByDisplayValue("Buy milk")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Get whole milk")).toBeInTheDocument()
  })

  test("given: the edit form, should: render save and cancel buttons", () => {
    const todo = createPopulatedTodo({ title: "Test" })
    const path = "/"
    const RouterStub = createRoutesStub([
      {
        Component: () => (
          <TodoItemEditComponent
            fetcher={createMockFetcher()}
            onCancel={vi.fn()}
            todo={todo}
          />
        ),
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })
})
