import {
  IconArrowLeft,
  IconCheck,
  IconEye,
  IconSparkles,
} from "@tabler/icons-react"
import { Form, Link } from "react-router"

import type { LineageDiagnostic } from "../domain/corpus"
import type { ManualMemoryDraft } from "./manual-memory-draft"
import * as s from "./manual-memory-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"

type ActionData =
  | {
      diagnostics?: LineageDiagnostic[]
      draft?: ManualMemoryDraft
      preview?: {
        canonicalJson: string
        document: {
          prompts: Array<{ challenge: string[]; resolution: string[] }>
        }
      }
      quickError?: string
      quickInput?: string
      valid?: boolean
    }
  | undefined

export function ManualMemoryPage({
  actionData,
  baseDigest,
  corpora,
  initialDraft,
  mode = "create",
  selectedCorpusId,
  userEmail,
}: {
  actionData: ActionData
  baseDigest?: string
  corpora: string[]
  initialDraft?: ManualMemoryDraft
  mode?: "create" | "edit"
  selectedCorpusId: string
  userEmail: string
}) {
  const draft = actionData?.draft ?? initialDraft
  const editing = mode === "edit"
  const previewPrompt =
    actionData?.valid && actionData.preview
      ? actionData.preview.document.prompts.at(-1)
      : null

  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          actions={
            <div className={s.headerActions}>
              <Link className={s.secondaryAction} to="/create/image-occlusion">
                Create image occlusion
              </Link>
              <Link className={s.secondaryAction} to="/create/ai">
                Generate with AI
              </Link>
            </div>
          }
          description={
            editing
              ? "Create a new immutable revision, review the semantic changes, then approve the exact preview."
              : "Shape a durable basic or cloze memory, validate it through Lineage, then approve the exact preview before saving."
          }
          eyebrow={editing ? "Revise" : "Create"}
          title={editing ? "Revise this memory" : "Create a memory"}
        />

        {!editing && (
          <Form className={s.quickCard} method="post">
            <input name="corpusId" type="hidden" value={selectedCorpusId} />
            <label className={s.quickField}>
              <span>Quick capture</span>
              <input
                defaultValue={actionData?.quickInput}
                name="quickInput"
                placeholder="What is i²? >> −1  or  The capital is {{Paris}}"
                required
              />
            </label>
            <Button name="intent" type="submit" value="quick-create">
              <IconCheck aria-hidden="true" />
              Create memory
            </Button>
            <p className={s.quickHelp}>
              Use <code>question &gt;&gt; answer</code> for a basic memory or
              wrap one or more answers in <code>{"{{double braces}}"}</code> for
              cloze deletions. Press Enter to save.
            </p>
            {actionData?.quickError && (
              <p className={s.quickError} role="alert">
                {actionData.quickError}
              </p>
            )}
            {actionData?.diagnostics && !actionData.draft && (
              <div className={s.quickError} role="alert">
                {actionData.diagnostics.map((diagnostic) => (
                  <p key={`${diagnostic.code}:${diagnostic.path}`}>
                    {diagnostic.message}
                  </p>
                ))}
              </div>
            )}
          </Form>
        )}

        <details
          className={s.advanced}
          open={editing || Boolean(actionData?.draft)}
        >
          <summary>{editing ? "Revision details" : "More options"}</summary>
          <div className={s.layout}>
            <Form className={s.formCard} method="post">
              {baseDigest && (
                <input name="baseDigest" type="hidden" value={baseDigest} />
              )}
              <div className={s.sectionHeading}>
                <IconSparkles aria-hidden="true" />
                <div>
                  <h2>Memory draft</h2>
                  <p>Nothing becomes durable until you approve the preview.</p>
                </div>
              </div>

              <label className={s.field}>
                <span>Corpus</span>
                <input
                  defaultValue={draft?.corpusId ?? selectedCorpusId}
                  list="corpus-options"
                  name="corpusId"
                  placeholder="e.g. powers-of-i"
                  readOnly={editing}
                  required
                />
                <small>
                  Choose an existing corpus or enter a new durable corpus ID.
                </small>
              </label>
              <datalist id="corpus-options">
                {corpora.map((corpusId) => (
                  <option key={corpusId} value={corpusId} />
                ))}
              </datalist>

              <div className={s.twoColumns}>
                <label className={s.field}>
                  <span>Memory type</span>
                  <select defaultValue={draft?.kind ?? "basic"} name="kind">
                    <option value="basic">Basic</option>
                    <option value="cloze">Cloze</option>
                  </select>
                </label>
                <label className={s.field}>
                  <span>Response</span>
                  <select
                    defaultValue={draft?.responseMode ?? "self-check"}
                    name="responseMode"
                  >
                    <option value="self-check">Reveal and self-check</option>
                    <option value="text">Type a response</option>
                  </select>
                </label>
              </div>

              <label className={s.field}>
                <span>Stable memory ID</span>
                <input
                  defaultValue={draft?.promptId}
                  name="promptId"
                  placeholder="e.g. i-squared"
                  readOnly={editing}
                  required
                />
                <small>
                  This identity is preserved across future revisions.
                </small>
              </label>

              <label className={s.field}>
                <span>Challenge</span>
                <textarea
                  defaultValue={draft?.challenge}
                  name="challenge"
                  placeholder="What should you recall?"
                  required
                  rows={4}
                />
                <small>
                  For cloze memories, use a visible placeholder such as […].
                </small>
              </label>

              <label className={s.field}>
                <span>Answer</span>
                <textarea
                  defaultValue={draft?.answer}
                  name="answer"
                  placeholder="What should be revealed?"
                  required
                  rows={3}
                />
              </label>

              <label className={s.field}>
                <span>Optional cloze hint</span>
                <input
                  defaultValue={draft?.hint}
                  name="hint"
                  placeholder="A cue that does not reveal the answer"
                />
              </label>

              <Button name="intent" type="submit" value="preview">
                <IconEye aria-hidden="true" />
                Validate and preview
              </Button>
            </Form>

            <aside className={s.previewCard}>
              <div className={s.sectionHeading}>
                <IconEye aria-hidden="true" />
                <div>
                  <h2>Approval preview</h2>
                  <p>The same disclosure boundary used during review.</p>
                </div>
              </div>

              {actionData?.valid && actionData.preview && previewPrompt ? (
                <>
                  <div className={s.reviewPreview}>
                    <span className={s.previewLabel}>Challenge</span>
                    {previewPrompt.challenge.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <details>
                      <summary>Reveal resolution</summary>
                      <div className={s.resolution}>
                        {previewPrompt.resolution.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </details>
                  </div>
                  <Form method="post">
                    {baseDigest && (
                      <input
                        name="baseDigest"
                        type="hidden"
                        value={baseDigest}
                      />
                    )}
                    <input
                      name="candidateJson"
                      type="hidden"
                      value={actionData.preview.canonicalJson}
                    />
                    <Button name="intent" type="submit" value="accept">
                      <IconCheck aria-hidden="true" />
                      Approve and save memory
                    </Button>
                  </Form>
                </>
              ) : actionData?.draft && actionData.diagnostics ? (
                <div className={s.diagnostics} role="alert">
                  <h3>Fix these details</h3>
                  <ul>
                    {actionData.diagnostics.map((diagnostic) => (
                      <li key={`${diagnostic.code}:${diagnostic.path}`}>
                        <strong>{diagnostic.code}</strong>
                        <span>{diagnostic.message}</span>
                        <code>{diagnostic.path}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={s.emptyPreview}>
                  <p>
                    Complete the draft to see the exact challenge and
                    resolution.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </details>

        <Link className={s.backLink} to="/library">
          <IconArrowLeft aria-hidden="true" />
          Back to Library
        </Link>
      </div>
    </AppShell>
  )
}
