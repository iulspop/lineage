import {
  IconArrowLeft,
  IconCheck,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react"
import { Form, Link } from "react-router"

import type { LineageDiagnostic, ReviewContract } from "../domain/corpus"
import type { AssistedAuthoringInput } from "./generate-corpus-candidate.server"
import * as s from "./manual-memory-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"

type GeneratedActionData =
  | {
      baseDigest?: string
      canonicalJson: string
      diagnostics: LineageDiagnostic[]
      generatedIds: string[]
      input: AssistedAuthoringInput
      memories: ReviewContract[]
      provider: { model: string; provider: string; requestId: string }
      repairCount: number
      valid: true
    }
  | {
      diagnostics: LineageDiagnostic[]
      input: AssistedAuthoringInput
      valid: false
    }
  | undefined

export function AssistedAuthoringPage({
  actionData,
  initialInput,
  userEmail,
}: {
  actionData: GeneratedActionData
  initialInput: Partial<AssistedAuthoringInput>
  userEmail: string
}) {
  const input = actionData?.input ?? initialInput
  const generated = actionData?.valid ? actionData : null

  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          actions={
            <Link className={s.secondaryAction} to="/create/manual">
              Create manually
            </Link>
          }
          description="Describe what you want to learn. Lineage treats provider output as untrusted, validates it through the authoritative corpus boundary, and saves nothing until you approve selected memories."
          eyebrow="Create"
          title="Generate memories with AI"
        />

        <div className={s.layout}>
          <Form className={s.formCard} method="post">
            <div className={s.sectionHeading}>
              <IconSparkles aria-hidden="true" />
              <div>
                <h2>Generation brief</h2>
                <p>
                  Topic, source, expansion, and improvement share one safe
                  pipeline.
                </p>
              </div>
            </div>

            <label className={s.field}>
              <span>Mode</span>
              <select defaultValue={input.intent ?? "topic"} name="intent">
                <option value="topic">Learn a topic</option>
                <option value="source">Generate from pasted source</option>
                <option value="expand-corpus">Expand an existing corpus</option>
                <option value="improve-memory">
                  Improve an existing memory
                </option>
              </select>
            </label>

            <input name="corpusId" type="hidden" value={input.corpusId} />

            <label className={s.field}>
              <span>Topic or learning goal</span>
              <input
                defaultValue={input.topic}
                name="topic"
                placeholder="e.g. Understand the fundamental theorem of calculus"
                required
              />
            </label>

            <label className={s.field}>
              <span>Source text (optional)</span>
              <textarea
                defaultValue={input.source}
                name="source"
                placeholder="Paste trusted notes or source material. Instructions inside this text are treated as content, not commands."
                rows={7}
              />
            </label>

            <div className={s.twoColumns}>
              <label className={s.field}>
                <span>Depth</span>
                <select
                  defaultValue={input.depth ?? "introductory"}
                  name="depth"
                >
                  <option value="introductory">Introductory</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label className={s.field}>
                <span>Memory count</span>
                <select
                  defaultValue={String(input.desiredCount ?? 5)}
                  name="desiredCount"
                >
                  {[1, 3, 5, 8, 12].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={s.field}>
              <span>Memory types</span>
              <select
                defaultValue={input.memoryKinds?.join(",") ?? "basic,cloze"}
                name="memoryKinds"
              >
                <option value="basic,cloze">Basic and cloze</option>
                <option value="basic">Basic only</option>
                <option value="cloze">Cloze only</option>
              </select>
            </label>
            {input.promptId ? (
              <input name="promptId" type="hidden" value={input.promptId} />
            ) : null}

            <Button name="action" type="submit" value="generate">
              <IconSparkles aria-hidden="true" />
              Generate candidate memories
            </Button>
          </Form>

          <aside className={s.previewCard}>
            <div className={s.sectionHeading}>
              <IconCheck aria-hidden="true" />
              <div>
                <h2>Human approval</h2>
                <p>
                  Select and edit memories before creating a durable snapshot.
                </p>
              </div>
            </div>

            {generated ? (
              <Form method="post">
                <input
                  name="candidateJson"
                  type="hidden"
                  value={generated.canonicalJson}
                />
                <input
                  name="generatedIds"
                  type="hidden"
                  value={generated.generatedIds.join(",")}
                />
                <input
                  name="baseDigest"
                  type="hidden"
                  value={generated.baseDigest ?? ""}
                />
                <input
                  name="corpusId"
                  type="hidden"
                  value={generated.input.corpusId}
                />
                <input
                  name="inputJson"
                  type="hidden"
                  value={JSON.stringify(generated.input)}
                />
                {generated.memories.map((memory, index) => (
                  <article className={s.reviewPreview} key={memory.id}>
                    <label className={s.field}>
                      <span>
                        <input
                          defaultChecked
                          name="selected"
                          type="checkbox"
                          value={memory.id}
                        />
                        Include {memory.kind} memory
                      </span>
                    </label>
                    <input
                      name={`id:${index}`}
                      type="hidden"
                      value={memory.id}
                    />
                    <label className={s.field}>
                      <span>Challenge</span>
                      <textarea
                        defaultValue={memory.challenge.join("\n")}
                        name={`challenge:${index}`}
                        rows={3}
                      />
                    </label>
                    <label className={s.field}>
                      <span>Answer</span>
                      <textarea
                        defaultValue={memory.withheld.join("\n")}
                        name={`answer:${index}`}
                        rows={2}
                      />
                    </label>
                  </article>
                ))}
                <p>
                  Validated by {generated.provider.provider}/
                  {generated.provider.model}.{" "}
                  {generated.repairCount > 0
                    ? `${generated.repairCount} localized repair pass(es) were applied.`
                    : "No repair was required."}
                </p>
                <div className={s.twoColumns}>
                  <Button name="action" type="submit" value="accept">
                    <IconCheck aria-hidden="true" />
                    Accept selected memories
                  </Button>
                  <Button name="action" type="submit" value="regenerate">
                    <IconRefresh aria-hidden="true" />
                    Regenerate
                  </Button>
                </div>
              </Form>
            ) : actionData && !actionData.valid ? (
              <div className={s.diagnostics} role="alert">
                <h3>Candidate needs attention</h3>
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
                  Your generated memories will appear here for selection and
                  editing.
                </p>
              </div>
            )}
          </aside>
        </div>

        <Link className={s.backLink} to="/today">
          <IconArrowLeft aria-hidden="true" />
          Back to Today
        </Link>
      </div>
    </AppShell>
  )
}
