import { data } from "react-router"
import { match } from "ts-pattern"

import {
  CLEAR_COMPLETED_INTENT,
  CREATE_TODO_INTENT,
  DELETE_TODO_INTENT,
  EDIT_TODO_INTENT,
  TOGGLE_TODO_INTENT,
} from "../domain/todos-constants"
import {
  extractCompletedIds,
  toggleCompleted,
  validateNewTodo,
  validateTodoUpdate,
} from "../domain/todos-domain"
import {
  deleteCompletedTodosFromDatabaseByIds,
  deleteTodoFromDatabaseById,
  retrieveAllTodosFromDatabase,
  retrieveTodoFromDatabaseById,
  saveTodoToDatabase,
  updateTodoInDatabaseById,
} from "../infrastructure/todos-model.server"
import { todoActionSchema } from "./todos-schemas"
import type { Route } from ".react-router/types/app/routes/+types/index"

export const todosAction = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const parsed = todoActionSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success)
    return data(
      { error: "Invalid form data", success: false as const },
      { status: 400 },
    )

  return match(parsed.data)
    .with({ intent: CLEAR_COMPLETED_INTENT }, async () => {
      const allTodos = await retrieveAllTodosFromDatabase()
      const ids = extractCompletedIds(allTodos)
      await deleteCompletedTodosFromDatabaseByIds(ids)
      return data({ error: null, success: true as const })
    })
    .with({ intent: CREATE_TODO_INTENT }, async ({ description, title }) => {
      const result = validateNewTodo({ description, title })
      if (!result.success)
        return data(
          { error: result.error, success: false as const },
          { status: 400 },
        )

      await saveTodoToDatabase(result.data)
      return data({ error: null, success: true as const })
    })
    .with({ intent: DELETE_TODO_INTENT }, async ({ id }) => {
      await deleteTodoFromDatabaseById(id)
      return data({ error: null, success: true as const })
    })
    .with({ intent: EDIT_TODO_INTENT }, async ({ description, id, title }) => {
      const todo = await retrieveTodoFromDatabaseById(id)
      if (!todo)
        return data(
          { error: "Todo not found", success: false as const },
          { status: 404 },
        )

      const result = validateTodoUpdate({ description, title })
      if (!result.success)
        return data(
          { error: result.error, success: false as const },
          { status: 400 },
        )

      await updateTodoInDatabaseById({ data: result.data, id })
      return data({ error: null, success: true as const })
    })
    .with({ intent: TOGGLE_TODO_INTENT }, async ({ id }) => {
      const todo = await retrieveTodoFromDatabaseById(id)
      if (!todo)
        return data(
          { error: "Todo not found", success: false as const },
          { status: 404 },
        )

      await updateTodoInDatabaseById({
        data: { completed: toggleCompleted(todo.completed) },
        id,
      })

      return data({ error: null, success: true as const })
    })
    .exhaustive()
}
