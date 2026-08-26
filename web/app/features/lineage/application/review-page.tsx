import { Form } from "react-router"

import * as s from "./review-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

const assessments = ["again", "hard", "good", "easy"] as const

type ReviewActionData =
  | { completed: false; attempt: string | null; presentation: string[] }
  | {
      assessment: (typeof assessments)[number]
      attempt: string | null
      completed: true
      presentation: string[]
    }
  | { error: string }
  | undefined

type ReviewLoaderData = {
  due: boolean
  dueAt: string | null
  history: Array<{
    assessment: (typeof assessments)[number]
    attemptedResponse: string | null
    nextIntervalMinutes: number
    promptId: string
    reviewedAt: string
  }>
  presentation: string[]
  prompt: { id: string; revision: number }
  reviewCount: number
  userEmail: string
}

function formatInterval(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} hr`
  return `${Math.round(minutes / (24 * 60))} days`
}

export function ReviewPage({
  actionData,
  loaderData,
}: {
  actionData: ReviewActionData
  loaderData: ReviewLoaderData
}) {
  const resolved = actionData && "completed" in actionData ? actionData : null
  const presentation = resolved?.presentation ?? loaderData.presentation

  return (
    <AppShell userEmail={loaderData.userEmail}>
      <div className={s.page}>
        <header className={s.header}>
          <div>
            <p className={s.eyebrow}>Prompt {loaderData.prompt.id}</p>
            <h1 className={s.title}>Review</h1>
          </div>
          <div className={s.progress}>
            <p>{loaderData.reviewCount} reviews recorded</p>
            <p>
              {loaderData.due
                ? "Due now"
                : `Next review ${new Date(loaderData.dueAt ?? "").toLocaleString()}`}
            </p>
          </div>
        </header>

        <section aria-live="polite" className={s.card}>
          <div className={s.content}>
            {presentation.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          {!resolved ? (
            <Form className={s.form} method="post">
              <FieldLabel htmlFor="review-attempt">Your answer</FieldLabel>
              <Input autoComplete="off" id="review-attempt" name="attempt" />
              <div className={s.actions}>
                <Button name="intent" type="submit" value="resolve">
                  Show answer
                </Button>
              </div>
            </Form>
          ) : resolved.completed ? (
            <div className={s.complete}>
              <strong>Review recorded as {resolved.assessment}.</strong>
              <Form action="/review" method="get">
                <Button type="submit">Review again</Button>
              </Form>
            </div>
          ) : (
            <div className={s.resolution}>
              <p>
                <strong>Your answer:</strong> {resolved.attempt || "No answer"}
              </p>
              <Form className={s.form} method="post">
                <input
                  name="attempt"
                  type="hidden"
                  value={resolved.attempt ?? ""}
                />
                <fieldset className={s.assessmentGroup}>
                  <legend>How well did you remember?</legend>
                  {assessments.map((assessment) => (
                    <Button
                      key={assessment}
                      name="assessment"
                      type="submit"
                      value={assessment}
                    >
                      {assessment[0]?.toUpperCase()}
                      {assessment.slice(1)}
                    </Button>
                  ))}
                </fieldset>
                <input name="intent" type="hidden" value="assess" />
              </Form>
            </div>
          )}
        </section>

        <section className={s.history}>
          <h2>Recent history</h2>
          {loaderData.history.length ? (
            <ol className={s.historyList}>
              {loaderData.history.map((review) => (
                <li className={s.historyItem} key={review.reviewedAt}>
                  <div>
                    <strong>{review.assessment}</strong>
                    <p>{review.attemptedResponse || "No answer"}</p>
                  </div>
                  <div className={s.historyMeta}>
                    <time dateTime={review.reviewedAt}>
                      {new Date(review.reviewedAt).toLocaleString()}
                    </time>
                    <span>
                      Next interval:{" "}
                      {formatInterval(review.nextIntervalMinutes)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={s.emptyHistory}>No completed reviews yet.</p>
          )}
        </section>
      </div>
    </AppShell>
  )
}
