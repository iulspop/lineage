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
      nextIntervalMinutes: number
      presentation: string[]
    }
  | { error: string }
  | undefined

type ReviewLoaderData = {
  corpora: Array<{ corpusId: string; formatVersion: number }>
  corpusId: string
  due: boolean
  dueAt: string | null
  history: Array<{
    assessment: (typeof assessments)[number]
    attemptedResponse: string | null
    nextIntervalMinutes: number
    promptId: string
    reviewedAt: string
  }>
  reviewCount: number
  reviewedAt: string
  snapshotDigest: string
  userEmail: string
} & (
  | {
      assessmentPreviews: null
      captureResponse: boolean
      presentation: string[]
      prompt: null
    }
  | {
      assessmentPreviews: Record<(typeof assessments)[number], number>
      captureResponse: boolean
      presentation: string[]
      prompt: { id: string; revision: number }
    }
)

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
            <p className={s.eyebrow}>
              {loaderData.prompt
                ? `Prompt ${loaderData.prompt.id}`
                : "Review queue"}
            </p>
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

        <Form className={s.corpusPicker} method="get">
          <FieldLabel className={s.corpusPickerLabel} htmlFor="review-corpus">
            Corpus
          </FieldLabel>
          <select
            className={s.corpusSelect}
            defaultValue={loaderData.corpusId}
            id="review-corpus"
            name="corpusId"
          >
            {loaderData.corpora.map((corpus) => (
              <option key={corpus.corpusId} value={corpus.corpusId}>
                {corpus.corpusId} · format {corpus.formatVersion}
              </option>
            ))}
          </select>
          <Button type="submit">Choose corpus</Button>
        </Form>

        <section aria-live="polite" className={s.card}>
          {loaderData.prompt ? (
            <>
              <div className={s.content}>
                {presentation.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>

              {!resolved ? (
                <Form className={s.form} method="post">
                  <input
                    name="corpusId"
                    type="hidden"
                    value={loaderData.corpusId}
                  />
                  <input
                    name="promptId"
                    type="hidden"
                    value={loaderData.prompt.id}
                  />
                  <input
                    name="promptRevision"
                    type="hidden"
                    value={loaderData.prompt.revision}
                  />
                  <input
                    name="snapshotDigest"
                    type="hidden"
                    value={loaderData.snapshotDigest}
                  />
                  {loaderData.captureResponse ? (
                    <>
                      <FieldLabel htmlFor="review-attempt">
                        Your answer
                      </FieldLabel>
                      <Input
                        autoComplete="off"
                        id="review-attempt"
                        name="attempt"
                      />
                    </>
                  ) : (
                    <p>
                      Recall the answer, then reveal it and assess yourself.
                    </p>
                  )}
                  <div className={s.actions}>
                    <Button name="intent" type="submit" value="resolve">
                      Show answer
                    </Button>
                  </div>
                </Form>
              ) : resolved.completed ? (
                <div className={s.complete}>
                  <strong>Review recorded as {resolved.assessment}.</strong>
                  <p>
                    Next review in{" "}
                    {formatInterval(resolved.nextIntervalMinutes)}.
                  </p>
                  <Form action="/review" method="get">
                    <input
                      name="corpusId"
                      type="hidden"
                      value={loaderData.corpusId}
                    />
                    <Button type="submit">Review again</Button>
                  </Form>
                </div>
              ) : (
                <div className={s.resolution}>
                  <p>
                    <strong>Your answer:</strong>{" "}
                    {resolved.attempt || "No answer"}
                  </p>
                  <Form className={s.form} method="post">
                    <input
                      name="corpusId"
                      type="hidden"
                      value={loaderData.corpusId}
                    />
                    <input
                      name="promptId"
                      type="hidden"
                      value={loaderData.prompt.id}
                    />
                    <input
                      name="promptRevision"
                      type="hidden"
                      value={loaderData.prompt.revision}
                    />
                    <input
                      name="snapshotDigest"
                      type="hidden"
                      value={loaderData.snapshotDigest}
                    />
                    <input
                      name="attempt"
                      type="hidden"
                      value={resolved.attempt ?? ""}
                    />
                    <input
                      name="reviewedAt"
                      type="hidden"
                      value={loaderData.reviewedAt}
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
                          <span>
                            {assessment[0]?.toUpperCase()}
                            {assessment.slice(1)}
                          </span>
                          <span>
                            {formatInterval(
                              loaderData.assessmentPreviews[assessment],
                            )}
                          </span>
                        </Button>
                      ))}
                    </fieldset>
                    <input name="intent" type="hidden" value="assess" />
                  </Form>
                </div>
              )}
            </>
          ) : (
            <div className={s.complete}>
              <strong>No reviews due</strong>
              <p>
                {loaderData.dueAt
                  ? `Next review ${new Date(loaderData.dueAt).toLocaleString()}.`
                  : "This corpus has no scheduled reviews."}
              </p>
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
