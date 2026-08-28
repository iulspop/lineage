import { useEffect, useState } from "react"
import { Form, Link } from "react-router"

import * as s from "./review-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { formatDateTime, useTimeZone } from "~/utils/time-zone"

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
  corpusId: string
  due: boolean
  dueAt: string | null
  dueCount: number
  history: Array<{
    assessment: (typeof assessments)[number]
    attemptedResponse: string | null
    nextIntervalMinutes: number
    promptId: string
    reviewedAt: string
  }>
  reviewCount: number
  reviewedAt: string
  sessionCompleted: number
  sessionLimit: number | null
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
      prompt: {
        id: string
        kind?: string
        occlusionRegions?: Array<{
          geometry:
            | {
                height: number
                type: "rectangle"
                width: number
                x: number
                y: number
              }
            | { points: Array<{ x: number; y: number }>; type: "polygon" }
          id: string
        }>
        revision: number
        sourceAsset?: string
      }
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
  const [showShortcuts, setShowShortcuts] = useState(false)
  const timeZone = useTimeZone()
  const resolved = actionData && "completed" in actionData ? actionData : null
  const presentation = resolved?.presentation ?? loaderData.presentation
  const sessionFinished =
    loaderData.sessionLimit !== null &&
    loaderData.sessionCompleted >= loaderData.sessionLimit
  const nextCompleted = loaderData.sessionCompleted + 1
  const continueSearch = new URLSearchParams({
    completed: String(nextCompleted),
  })
  if (loaderData.sessionLimit !== null) {
    continueSearch.set("limit", String(loaderData.sessionLimit))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }
      if (event.key === "?") {
        setShowShortcuts((visible) => !visible)
        return
      }
      const shortcut =
        event.key === " " || event.key === "Enter" ? "reveal" : event.key
      const control = document.querySelector<HTMLButtonElement>(
        `[data-review-shortcut="${shortcut}"]`,
      )
      if (control && !control.disabled) {
        event.preventDefault()
        control.click()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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
              {loaderData.sessionLimit
                ? `${loaderData.sessionCompleted} of ${loaderData.sessionLimit} in this session`
                : `${loaderData.dueCount} due in this corpus`}
            </p>
            <p>
              {loaderData.due
                ? "Due now"
                : `Next review ${formatDateTime(loaderData.dueAt ?? "", timeZone)}`}
            </p>
            {loaderData.prompt && (
              <Link
                className={s.memoryLink}
                to={`/library/${encodeURIComponent(loaderData.corpusId)}/memories/${encodeURIComponent(loaderData.prompt.id)}`}
              >
                Inspect or revise this memory
              </Link>
            )}
          </div>
        </header>

        <div className={s.shortcutBar}>
          <span>Space reveal · 1–4 assess</span>
          <button
            aria-expanded={showShortcuts}
            className={s.shortcutButton}
            onClick={() => setShowShortcuts((visible) => !visible)}
            type="button"
          >
            Keyboard help (?)
          </button>
        </div>
        {showShortcuts && (
          <section
            aria-label="Review keyboard shortcuts"
            className={s.shortcutHelp}
          >
            <strong>Keyboard shortcuts</strong>
            <p>
              Space or Enter reveals the answer. Use 1–4 for Again, Hard, Good,
              and Easy.
            </p>
          </section>
        )}

        <Form className={s.corpusPicker} method="get">
          <div className={s.pickerField}>
            <FieldLabel htmlFor="review-limit">Session length</FieldLabel>
            <select
              className={s.corpusSelect}
              defaultValue={loaderData.sessionLimit ?? ""}
              id="review-limit"
              name="limit"
            >
              <option value="">All due</option>
              <option value="10">10 memories</option>
              <option value="20">20 memories</option>
              <option value="50">50 memories</option>
            </select>
          </div>
          <Button type="submit">Start session</Button>
        </Form>

        <section aria-live="polite" className={s.card}>
          {sessionFinished ? (
            <div className={s.sessionSummary}>
              <p className={s.eyebrow}>Session complete</p>
              <h2>{loaderData.sessionCompleted} memories reviewed</h2>
              <p>
                {loaderData.dueCount > 0
                  ? `${loaderData.dueCount} memories remain due. Start another session whenever you are ready.`
                  : "You cleared the due queue for this corpus."}
              </p>
              <div className={s.actions}>
                <Link className={s.secondaryLink} to="/today">
                  Return to Today
                </Link>
                {loaderData.dueCount > 0 && (
                  <Link className={s.continueLink} to="/review">
                    Continue reviewing
                  </Link>
                )}
              </div>
            </div>
          ) : loaderData.prompt ? (
            <>
              <div className={s.content}>
                {presentation.map((item) => (
                  <p key={item}>{item}</p>
                ))}
                {loaderData.prompt.kind === "image-occlusion" &&
                loaderData.prompt.sourceAsset ? (
                  <div className={s.reviewImage}>
                    <img
                      alt="Visual with the target region concealed"
                      src={`/library/${encodeURIComponent(loaderData.corpusId)}/assets/${encodeURIComponent(loaderData.prompt.sourceAsset)}`}
                    />
                    {!resolved
                      ? loaderData.prompt.occlusionRegions?.map((region) =>
                          region.geometry.type === "rectangle" ? (
                            <span
                              aria-hidden="true"
                              className={s.reviewOcclusion}
                              key={region.id}
                              style={{
                                height: `${region.geometry.height * 100}%`,
                                left: `${region.geometry.x * 100}%`,
                                top: `${region.geometry.y * 100}%`,
                                width: `${region.geometry.width * 100}%`,
                              }}
                            />
                          ) : null,
                        )
                      : null}
                  </div>
                ) : null}
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
                    <Button
                      data-review-shortcut="reveal"
                      name="intent"
                      type="submit"
                      value="resolve"
                    >
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
                  <div className={s.actions}>
                    {(resolved.assessment === "again" ||
                      resolved.assessment === "hard") && (
                      <Link
                        className={s.secondaryLink}
                        to={`/library/${encodeURIComponent(loaderData.corpusId)}/memories/${encodeURIComponent(loaderData.prompt.id)}`}
                      >
                        Inspect difficult memory
                      </Link>
                    )}
                    <Link
                      className={s.continueLink}
                      to={`/review?${continueSearch.toString()}`}
                    >
                      {loaderData.sessionLimit !== null &&
                      nextCompleted >= loaderData.sessionLimit
                        ? "Finish session"
                        : "Next memory"}
                    </Link>
                  </div>
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
                      {assessments.map((assessment, index) => (
                        <Button
                          data-review-shortcut={String(index + 1)}
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
                  ? `Next review ${formatDateTime(loaderData.dueAt, timeZone)}.`
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
                      {formatDateTime(review.reviewedAt, timeZone)}
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
