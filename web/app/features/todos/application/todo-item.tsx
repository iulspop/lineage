import { IconCheck, IconPencil, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Form, useFetcher } from "react-router"

import type { Todo } from "../../../../generated/prisma/client"
import {
  DELETE_TODO_INTENT,
  TOGGLE_TODO_INTENT,
} from "../domain/todos-constants"
import * as s from "./todo-item.css"
import { TodoItemEditComponent } from "./todo-item-edit"
import { Button } from "~/components/ui/button"

export function TodoItemDisplayComponent({
  onEdit,
  todo,
}: {
  onEdit: () => void
  todo: Todo
}) {
  return (
    <li className={s.item}>
      <Form method="post">
        <input name="id" type="hidden" value={todo.id} />
        <Button
          aria-label={`Toggle ${todo.title}`}
          className={todo.completed ? s.toggleChecked : s.toggle}
          name="intent"
          size="icon-sm"
          type="submit"
          value={TOGGLE_TODO_INTENT}
          variant="outline"
        >
          {todo.completed && <IconCheck className={s.checkIcon} />}
        </Button>
      </Form>

      <div className={s.content}>
        <span
          className={todo.completed ? s.completedTitle : undefined}
          data-completed={todo.completed}
        >
          {todo.title}
        </span>
        {todo.description && (
          <p className={s.description}>{todo.description}</p>
        )}
        <span className={s.status}>
          {todo.completed ? "Completed" : "Open"}
        </span>
      </div>

      <div className={s.actions}>
        <Button
          aria-label={`Edit ${todo.title}`}
          onClick={onEdit}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <IconPencil className={s.actionIcon} />
        </Button>

        <Form method="post">
          <input name="id" type="hidden" value={todo.id} />
          <Button
            aria-label={`Delete ${todo.title}`}
            name="intent"
            size="icon-sm"
            type="submit"
            value={DELETE_TODO_INTENT}
            variant="ghost"
          >
            <IconX className={s.actionIcon} />
          </Button>
        </Form>
      </div>
    </li>
  )
}

export function TodoItemComponent({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false)
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      setIsEditing(false)
    }
  }, [fetcher.state, fetcher.data])

  if (isEditing) {
    return (
      <TodoItemEditComponent
        fetcher={fetcher}
        onCancel={() => setIsEditing(false)}
        todo={todo}
      />
    )
  }

  return (
    <TodoItemDisplayComponent onEdit={() => setIsEditing(true)} todo={todo} />
  )
}
