import {
  IconArrowLeft,
  IconEdit,
  IconKeyboard,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { Form, Link, useNavigate, useSearchParams } from "react-router"

import * as s from "./review-page.css"
import { LatexText } from "~/components/latex-text/latex-text"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { ReviewContract } from "~/features/lineage/domain/corpus"
import { useTimeZone } from "~/utils/time-zone"

const assessments = ["again", "hard", "good", "easy"] as const

function formatInterval(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  if (minutes < 1440) return `${Math.round(minutes / 60)} hr`
  return `${Math.round(minutes / 1440)} d`
}

function formatDateTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value))
}

export function ReviewPage({
  actionData,
  loaderData,
}: {
  actionData:
    | {
        attempt?: string | null
        completed: false
        presentation: string[]
      }
    | {
        assessment: string
        completed: true
        nextIntervalMinutes: number
      }
    | { error: string }
    | undefined
  loaderData: {
    assessmentPreviews: Record<(typeof assessments)[number], number> | null
    captureResponse: boolean
    corpusId: string
    due?: boolean
    dueAt: string | null
    dueCount: number
    history: Array<{
      assessment: string
      attemptedResponse: string | null
      nextIntervalMinutes: number
      reviewedAt: string
    }>
    presentation: string[]
    prompt:
      | (Pick<ReviewContract, "id" | "revision"> & Partial<ReviewContract>)
      | null
    reviewedAt: string
    reviewCount: number
    sessionCompleted: number
    sessionLimit: number | null
    snapshotDigest: string
    userEmail: string
  }
}) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [editing, setEditing] = useState(false)
  const editChallengeRef = useRef<HTMLTextAreaElement>(null)
  const editingSnapshotDigest = useRef(loaderData.snapshotDigest)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const timeZone = useTimeZone()
  const resolved = actionData && "completed" in actionData ? actionData : null
  const presentation =
    resolved?.completed === false
      ? resolved.presentation
      : loaderData.presentation
  const [primaryPresentation, ...supportingPresentation] = presentation
  const sessionFinished =
    loaderData.sessionLimit !== null &&
    loaderData.sessionCompleted >= loaderData.sessionLimit
  const nextCompleted = loaderData.sessionCompleted + 1
  const continueSearch = new URLSearchParams()
  if (loaderData.sessionLimit !== null)
    continueSearch.set("limit", String(loaderData.sessionLimit))
  continueSearch.set("completed", String(nextCompleted))
  const continueTo = `/review?${continueSearch.toString()}`
  const canQuickEdit =
    loaderData.prompt?.kind === "basic" || loaderData.prompt?.kind === "cloze"

  useEffect(() => {
    if (editing) editChallengeRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (editingSnapshotDigest.current === loaderData.snapshotDigest) return
    editingSnapshotDigest.current = loaderData.snapshotDigest
    setEditing(false)
  }, [loaderData.snapshotDigest])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable

      if (event.key === "Escape") {
        if (editing) {
          setEditing(false)
          event.preventDefault()
          return
        }
        if (showShortcuts) {
          setShowShortcuts(false)
          event.preventDefault()
          return
        }
        navigate("/today")
        return
      }

      if (typing) {
        if (
          editing &&
          (event.metaKey || event.ctrlKey) &&
          event.key === "Enter"
        ) {
          event.preventDefault()
          document
            .querySelector<HTMLButtonElement>(
              '[data-review-shortcut="save-edit"]',
            )
            ?.click()
        }
        return
      }

      if (event.key === "?") {
        event.preventDefault()
        setShowShortcuts((value) => !value)
        return
      }
      if (event.key.toLowerCase() === "e" && canQuickEdit && !resolved) {
        event.preventDefault()
        setEditing(true)
        return
      }
      if (event.key.toLowerCase() === "n" && resolved?.completed) {
        event.preventDefault()
        navigate(continueTo)
        return
      }
      if (!resolved && (event.key === " " || event.key === "Enter")) {
        event.preventDefault()
        document
          .querySelector<HTMLButtonElement>('[data-review-shortcut="reveal"]')
          ?.click()
        return
      }
      if (resolved?.completed === false && /^[1-4]$/.test(event.key)) {
        event.preventDefault()
        document
          .querySelector<HTMLButtonElement>(
            `[data-review-shortcut="${event.key}"]`,
          )
          ?.click()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [canQuickEdit, continueTo, editing, navigate, resolved, showShortcuts])

  return (
    <main className={s.shell}>
      <header className={s.topbar}>
        <Link aria-label="Exit review" className={s.iconLink} to="/today">
          <IconArrowLeft aria-hidden="true" />
        </Link>
        <div className={s.sessionProgress}>
          <span>
            {loaderData.sessionLimit === null
              ? `${loaderData.dueCount} due`
              : `${Math.min(loaderData.sessionCompleted + 1, loaderData.sessionLimit)} / ${loaderData.sessionLimit}`}
          </span>
          <span aria-hidden="true">·</span>
          <span>{loaderData.reviewCount} reviewed</span>
        </div>
        <div className={s.topbarActions}>
          {canQuickEdit && loaderData.prompt && !resolved ? (
            <button
              aria-label="Quick edit memory"
              className={s.iconButton}
              onClick={() => setEditing(true)}
              type="button"
            >
              <IconEdit aria-hidden="true" />
            </button>
          ) : null}
          <button
            aria-expanded={showShortcuts}
            aria-label="Keyboard shortcuts"
            className={s.iconButton}
            onClick={() => setShowShortcuts((value) => !value)}
            type="button"
          >
            <IconKeyboard aria-hidden="true" />
          </button>
        </div>
      </header>

      {showShortcuts ? (
        <aside className={s.shortcutHelp}>
          <div className={s.shortcutHelpHeader}>
            <strong>Keyboard shortcuts</strong>
            <button
              aria-label="Close keyboard shortcuts"
              className={s.iconButton}
              onClick={() => setShowShortcuts(false)}
              type="button"
            >
              <IconX aria-hidden="true" />
            </button>
          </div>
          <dl>
            <div>
              <dt>
                <kbd>Space</kbd>
              </dt>
              <dd>Reveal answer</dd>
            </div>
            <div>
              <dt>
                <kbd>1–4</kbd>
              </dt>
              <dd>Again · Hard · Good · Easy</dd>
            </div>
            <div>
              <dt>
                <kbd>E</kbd>
              </dt>
              <dd>Quick edit</dd>
            </div>
            <div>
              <dt>
                <kbd>N</kbd>
              </dt>
              <dd>Next memory</dd>
            </div>
            <div>
              <dt>
                <kbd>Esc</kbd>
              </dt>
              <dd>Close or exit review</dd>
            </div>
          </dl>
        </aside>
      ) : null}

      <section aria-live="polite" className={s.stage}>
        {sessionFinished ? (
          <div className={s.centeredState}>
            <p className={s.eyebrow}>Session complete</p>
            <h1>{loaderData.sessionCompleted} memories reviewed</h1>
            <p>
              {loaderData.dueCount > 0
                ? `${loaderData.dueCount} memories remain due.`
                : "You cleared the due queue."}
            </p>
            <div className={s.actions}>
              <Link className={s.secondaryLink} to="/today">
                Return to Today
              </Link>
              {loaderData.dueCount > 0 ? (
                <Link className={s.continueLink} to="/review">
                  Continue reviewing
                </Link>
              ) : null}
            </div>
          </div>
        ) : loaderData.prompt ? (
          <div className={s.reviewSurface}>
            <div className={s.content}>
              <h1
                className={
                  loaderData.prompt.kind === "image-occlusion"
                    ? s.visuallyHidden
                    : undefined
                }
              >
                <LatexText>
                  {loaderData.prompt.kind === "image-occlusion"
                    ? "Image occlusion memory"
                    : (primaryPresentation ?? "Memory")}
                </LatexText>
              </h1>
              {loaderData.prompt.kind !== "image-occlusion"
                ? supportingPresentation.map((item) => (
                    <p key={item}>
                      <LatexText>{item}</LatexText>
                    </p>
                  ))
                : null}
              {loaderData.prompt.kind === "image-occlusion" &&
              primaryPresentation ? (
                <p className={s.imageOcclusionHint}>
                  <LatexText>{primaryPresentation}</LatexText>
                </p>
              ) : null}
              {loaderData.prompt.kind === "image-occlusion" &&
              loaderData.prompt.sourceAsset ? (
                <div className={s.reviewImage}>
                  <img
                    alt="Visual with the target region concealed"
                    src={`/library/${encodeURIComponent(loaderData.corpusId)}/assets/${encodeURIComponent(loaderData.prompt.sourceAsset)}`}
                  />
                  {!resolved
                    ? loaderData.prompt.occlusionRegions?.map(
                        (region, index) =>
                          region.geometry.type === "rectangle" ? (
                            <span
                              aria-hidden="true"
                              className={
                                index === 0
                                  ? s.reviewTargetOcclusion
                                  : s.reviewOcclusion
                              }
                              data-occlusion-target={index === 0}
                              key={region.id}
                              style={{
                                height: `${region.geometry.height * 100}%`,
                                left: `${region.geometry.x * 100}%`,
                                top: `${region.geometry.y * 100}%`,
                                width: `${region.geometry.width * 100}%`,
                              }}
                            >
                              {index === 0 ? "?" : null}
                            </span>
                          ) : null,
                      )
                    : null}
                </div>
              ) : null}
            </div>

            {editing ? (
              <Form
                aria-label="Quick edit memory"
                aria-modal="true"
                className={s.editPanel}
                method="post"
                role="dialog"
              >
                <div className={s.editHeader}>
                  <div>
                    <p className={s.eyebrow}>Quick edit</p>
                    <h2>Revise without leaving review</h2>
                  </div>
                  <button
                    aria-label="Cancel quick edit"
                    className={s.iconButton}
                    onClick={() => setEditing(false)}
                    type="button"
                  >
                    <IconX aria-hidden="true" />
                  </button>
                </div>
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
                <input name="intent" type="hidden" value="revise" />
                <Label htmlFor="review-edit-challenge">Challenge</Label>
                <textarea
                  className={s.editTextarea}
                  defaultValue={(
                    loaderData.prompt.challenge ?? loaderData.presentation
                  ).join("\n")}
                  id="review-edit-challenge"
                  name="challenge"
                  ref={editChallengeRef}
                  rows={3}
                />
                <Label htmlFor="review-edit-answer">Answer</Label>
                <textarea
                  className={s.editTextarea}
                  defaultValue={(
                    loaderData.prompt.withheld ??
                    loaderData.prompt.resolution ??
                    []
                  ).join("\n")}
                  id="review-edit-answer"
                  name="answer"
                  rows={3}
                />
                <div className={s.editActions}>
                  <span>
                    <kbd>⌘↵</kbd> save
                  </span>
                  <Button data-review-shortcut="save-edit" type="submit">
                    Save revision
                  </Button>
                </div>
              </Form>
            ) : !resolved ? (
              <Form className={s.recallControls} method="post">
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
                  <div className={s.attemptField}>
                    <Label htmlFor="review-attempt">Your answer</Label>
                    <Input
                      autoComplete="off"
                      id="review-attempt"
                      name="attempt"
                    />
                  </div>
                ) : (
                  <p className={s.instruction}>
                    Recall the answer, then reveal it and assess yourself.
                  </p>
                )}
                <Button
                  data-review-shortcut="reveal"
                  name="intent"
                  type="submit"
                  value="resolve"
                >
                  Show answer <kbd>Space</kbd>
                </Button>
              </Form>
            ) : resolved.completed ? (
              <div className={s.completionControls}>
                <div>
                  <strong>Recorded as {resolved.assessment}</strong>
                  <p>
                    Next review in{" "}
                    {formatInterval(resolved.nextIntervalMinutes)}.
                  </p>
                </div>
                <Link className={s.continueLink} to={continueTo}>
                  {loaderData.sessionLimit !== null &&
                  nextCompleted >= loaderData.sessionLimit
                    ? "Finish session"
                    : "Next memory"}{" "}
                  <kbd>N</kbd>
                </Link>
              </div>
            ) : (
              <Form className={s.assessmentForm} method="post">
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
                <input name="intent" type="hidden" value="assess" />
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
                          loaderData.assessmentPreviews?.[assessment] ?? 0,
                        )}
                      </span>
                      <kbd>{index + 1}</kbd>
                    </Button>
                  ))}
                </fieldset>
              </Form>
            )}
          </div>
        ) : (
          <div className={s.centeredState}>
            <h1>No reviews due</h1>
            <p>
              {loaderData.dueAt
                ? `Next review ${formatDateTime(loaderData.dueAt, timeZone)}.`
                : "This workspace has no scheduled reviews."}
            </p>
            <Link className={s.continueLink} to="/today">
              Return to Today
            </Link>
          </div>
        )}
      </section>

      {actionData && "error" in actionData ? (
        <p className={s.error} role="alert">
          {actionData.error}
        </p>
      ) : null}

      {!loaderData.prompt && !sessionFinished ? null : (
        <footer className={s.footer}>
          <span>
            {searchParams.get("limit") ? "Focused session" : "All due memories"}
          </span>
          <span>
            Press <kbd>?</kbd> for shortcuts
          </span>
        </footer>
      )}
    </main>
  )
}
