import { useEffect, useState } from "react"
import { Form, Link } from "react-router"

import type { Todo } from "../../../../generated/prisma/client"
import {
  CLEAR_COMPLETED_INTENT,
  CREATE_TODO_INTENT,
} from "../domain/todos-constants"
import type { TodoFilter } from "../domain/todos-domain"
import {
  isTodoValidationError,
  validationErrorToMessage,
} from "../domain/todos-domain"
import { FilterTabsComponent } from "./filter-tabs"
import { TodoItemComponent } from "./todo-item"
import * as s from "./todos-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { RESEND_EMAIL_VERIFICATION_INTENT } from "~/features/auth/domain/auth-constants"

type TodosPageActionData =
  | { error: string; success: false }
  | { error: null; success: true }
  | {
      cooldownSeconds: number
      error: string | null
      intent: typeof RESEND_EMAIL_VERIFICATION_INTENT
      success: boolean
    }
  | undefined

export function TodosPageComponent({
  actionData,
  canClaimOwner = false,
  chatUnreadCount = 0,
  counts,
  filter,
  hasPasskeys = true,
  isEmailVerified = true,
  isOwner = false,
  resendEmailVerificationCooldownSeconds = 0,
  todos,
  userEmail = "",
}: {
  actionData?: TodosPageActionData
  canClaimOwner?: boolean
  chatUnreadCount?: number
  counts: { active: number; completed: number; total: number }
  filter: TodoFilter
  hasPasskeys?: boolean
  isEmailVerified?: boolean
  isOwner?: boolean
  resendEmailVerificationCooldownSeconds?: number
  todos: Todo[]
  userEmail?: string
}) {
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(
    resendEmailVerificationCooldownSeconds,
  )
  const [showDescription, setShowDescription] = useState(false)
  const isResendAction =
    actionData &&
    "intent" in actionData &&
    actionData.intent === RESEND_EMAIL_VERIFICATION_INTENT
  const formattedResendCooldown = `${Math.floor(resendCooldownSeconds / 60)}:${String(
    resendCooldownSeconds % 60,
  ).padStart(2, "0")}`

  useEffect(() => {
    setResendCooldownSeconds(resendEmailVerificationCooldownSeconds)
  }, [resendEmailVerificationCooldownSeconds])

  useEffect(() => {
    if (!isResendAction) return

    setResendCooldownSeconds(actionData.cooldownSeconds)
  }, [actionData, isResendAction])

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return

    const timeout = window.setTimeout(
      () => setResendCooldownSeconds((seconds) => seconds - 1),
      1000,
    )

    return () => window.clearTimeout(timeout)
  }, [resendCooldownSeconds])

  return (
    <AppShell
      canClaimOwner={canClaimOwner}
      chatUnreadCount={chatUnreadCount}
      isOwner={isOwner}
      userEmail={userEmail}
    >
      <div className={s.page}>
        <header className={s.header}>
          <div>
            <h1 className={s.title}>Todos</h1>
            <p className={s.subtitle}>
              Keep track of what needs to happen next.
            </p>
          </div>
        </header>

        {!isEmailVerified && (
          <section className={s.notice}>
            <h2 className={s.noticeTitle}>Verify your email</h2>
            <p className={s.noticeBody}>
              Confirm your email address to finish setting up your account.
            </p>
            {isResendAction && actionData.success && (
              <p className={s.noticeBody}>Verification email sent.</p>
            )}
            {isResendAction && !actionData.success && actionData.error && (
              <FieldError className={s.noticeBody}>
                {actionData.error}
              </FieldError>
            )}
            <Form className={s.noticeAction} method="post">
              <Button
                disabled={resendCooldownSeconds > 0}
                name="intent"
                type="submit"
                value={RESEND_EMAIL_VERIFICATION_INTENT}
                variant="outline"
              >
                {resendCooldownSeconds > 0
                  ? `Resend again in ${formattedResendCooldown}`
                  : "Resend verification email"}
              </Button>
            </Form>
          </section>
        )}

        {!hasPasskeys && (
          <section className={s.notice}>
            <h2 className={s.noticeTitle}>Add a passkey</h2>
            <p className={s.noticeBody}>
              Use your device unlock for faster future logins.
            </p>
            <Link className={s.noticeLink} to="/settings">
              Manage sign-in settings
            </Link>
          </section>
        )}

        <div className={s.workspace}>
          <aside className={s.capturePanel}>
            <Form className={s.form} method="post">
              <div className={s.formFields}>
                <div className={s.titleField}>
                  <FieldLabel htmlFor="todo-title">Task</FieldLabel>
                  <Input
                    id="todo-title"
                    name="title"
                    placeholder="What needs to be done?"
                    type="text"
                  />
                </div>
                {showDescription ? (
                  <div className={s.descriptionField}>
                    <FieldLabel htmlFor="todo-description">
                      Description{" "}
                      <span className={s.optionalLabel}>Optional</span>
                    </FieldLabel>
                    <Textarea
                      className={s.descriptionInput}
                      id="todo-description"
                      name="description"
                      placeholder="Add context or a definition of done"
                      rows={2}
                    />
                  </div>
                ) : null}
              </div>
              <div className={s.formFooter}>
                {!showDescription ? (
                  <Button
                    onClick={() => setShowDescription(true)}
                    type="button"
                    variant="ghost"
                  >
                    Add description
                  </Button>
                ) : null}
                <Button name="intent" type="submit" value={CREATE_TODO_INTENT}>
                  Add todo
                </Button>
              </div>
              {actionData?.success === false &&
                actionData.error &&
                isTodoValidationError(actionData.error) && (
                  <FieldError>
                    {validationErrorToMessage(actionData.error)}
                  </FieldError>
                )}
            </Form>
          </aside>

          <section aria-labelledby="task-queue-title" className={s.taskPanel}>
            <div className={s.taskPanelHeader}>
              <h2 className={s.taskPanelTitle} id="task-queue-title">
                Tasks
              </h2>
              <FilterTabsComponent counts={counts} currentFilter={filter} />
            </div>

            {counts.total === 0 ? (
              <EmptyState
                description="Add your first task using the composer above."
                title="No todos yet"
              />
            ) : todos.length === 0 ? (
              <EmptyState
                description="Try another filter or add a new task."
                title={
                  filter === "active" ? "No active todos" : "No completed todos"
                }
              />
            ) : (
              <ul className={s.list}>
                {todos.map((todo) => (
                  <TodoItemComponent key={todo.id} todo={todo} />
                ))}
              </ul>
            )}

            {counts.completed > 0 ? (
              <footer className={s.footer}>
                <Form method="post">
                  <Button
                    className={s.dangerAction}
                    name="intent"
                    type="submit"
                    value={CLEAR_COMPLETED_INTENT}
                    variant="link"
                  >
                    Clear completed
                  </Button>
                </Form>
              </footer>
            ) : null}
          </section>
        </div>
      </div>
    </AppShell>
  )
}
