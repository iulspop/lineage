import type { FetcherWithComponents } from "react-router"

import type { Todo } from "../../../../generated/prisma/client"
import { EDIT_TODO_INTENT } from "../domain/todos-constants"
import * as s from "./todo-item-edit.css"
import { Button } from "~/components/ui/button"
import { FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

export function TodoItemEditComponent({
  fetcher,
  onCancel,
  todo,
}: {
  fetcher: FetcherWithComponents<unknown>
  onCancel: () => void
  todo: Todo
}) {
  return (
    <li className={s.item}>
      <fetcher.Form className={s.form} method="post">
        <input name="id" type="hidden" value={todo.id} />
        <input name="intent" type="hidden" value={EDIT_TODO_INTENT} />
        <div className={s.field}>
          <FieldLabel htmlFor={`todo-title-${todo.id}`}>Task</FieldLabel>
          <Input
            defaultValue={todo.title}
            id={`todo-title-${todo.id}`}
            name="title"
            type="text"
          />
        </div>
        <div className={s.field}>
          <FieldLabel htmlFor={`todo-description-${todo.id}`}>
            Description
          </FieldLabel>
          <Textarea
            defaultValue={todo.description}
            id={`todo-description-${todo.id}`}
            name="description"
            rows={2}
          />
        </div>
        <div className={s.actions}>
          <Button size="sm" type="submit">
            Save
          </Button>
          <Button
            onClick={onCancel}
            size="sm"
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </fetcher.Form>
    </li>
  )
}
