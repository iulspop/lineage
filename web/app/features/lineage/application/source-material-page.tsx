import {
  IconBook2,
  IconCheck,
  IconFileText,
  IconLink,
} from "@tabler/icons-react"
import { Form, Link } from "react-router"

import type { CorpusDocument, LineageDiagnostic } from "../domain/corpus"
import type { KnowledgeDraft } from "./source-material-draft"
import * as s from "./source-material-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"

type ActionData =
  | ({ draft: KnowledgeDraft } & (
      | { canonicalJson: string; valid: true }
      | { diagnostics: LineageDiagnostic[]; valid: false }
    ))
  | undefined

export function SourceMaterialPage({
  actionData,
  corpus,
  snapshotDigest,
  userEmail,
}: {
  actionData: ActionData
  corpus: CorpusDocument
  snapshotDigest: string
  userEmail: string
}) {
  const draft = actionData?.draft
  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <Link
          to={`/library/${encodeURIComponent(corpus.corpusId)}?tab=sources`}
        >
          ← Back to corpus
        </Link>
        <PageHeader
          description="Create durable source revisions, shape reusable materials, and link them to memories. Every save produces a validated immutable corpus snapshot."
          eyebrow="Library · Sources"
          title="Manage sources and materials"
        />
        <div className={s.layout}>
          <section className={s.card}>
            <h2>
              <IconFileText aria-hidden="true" /> Source
            </h2>
            <form className={s.form} method="post">
              <input name="baseDigest" type="hidden" value={snapshotDigest} />
              <input name="kind" type="hidden" value="source" />
              <input
                name="id"
                type="hidden"
                value={draft?.kind === "source" ? draft.id : ""}
              />
              <label>
                <span>Title</span>
                <input
                  defaultValue={draft?.kind === "source" ? draft.title : ""}
                  name="title"
                  required
                />
              </label>
              <label>
                <span>Source text or citation</span>
                <textarea
                  defaultValue={draft?.kind === "source" ? draft.content : ""}
                  name="content"
                  required
                  rows={8}
                />
              </label>
              <fieldset>
                <legend>Link memories</legend>
                {corpus.prompts.map((prompt) => (
                  <label className={s.check} key={prompt.id}>
                    <input
                      defaultChecked={
                        draft?.kind === "source"
                          ? draft.linkedPromptIds.includes(prompt.id)
                          : prompt.sources.includes(draft?.id ?? "")
                      }
                      name="linkedPromptIds"
                      type="checkbox"
                      value={prompt.id}
                    />
                    <span>{prompt.challenge[0] ?? prompt.id}</span>
                  </label>
                ))}
              </fieldset>
              <Button name="intent" type="submit" value="preview">
                <IconLink aria-hidden="true" />
                Preview source changes
              </Button>
            </form>
          </section>
          <section className={s.card}>
            <h2>
              <IconBook2 aria-hidden="true" /> Material
            </h2>
            <form className={s.form} method="post">
              <input name="baseDigest" type="hidden" value={snapshotDigest} />
              <input name="kind" type="hidden" value="material" />
              <input
                name="id"
                type="hidden"
                value={draft?.kind === "material" ? draft.id : ""}
              />
              <label>
                <span>Material content</span>
                <textarea
                  defaultValue={draft?.kind === "material" ? draft.content : ""}
                  name="content"
                  required
                  rows={8}
                />
              </label>
              <fieldset>
                <legend>Source dependencies</legend>
                {corpus.sources.map((source) => (
                  <label className={s.check} key={source.id}>
                    <input
                      defaultChecked={
                        draft?.kind === "material" &&
                        draft.sourceIds.includes(source.id)
                      }
                      name="sourceIds"
                      type="checkbox"
                      value={source.id}
                    />
                    <span>{source.title}</span>
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Link memories</legend>
                {corpus.prompts.map((prompt) => (
                  <label className={s.check} key={prompt.id}>
                    <input
                      defaultChecked={
                        draft?.kind === "material"
                          ? draft.linkedPromptIds.includes(prompt.id)
                          : false
                      }
                      name="linkedPromptIds"
                      type="checkbox"
                      value={prompt.id}
                    />
                    <span>{prompt.challenge[0] ?? prompt.id}</span>
                  </label>
                ))}
              </fieldset>
              <Button name="intent" type="submit" value="preview">
                <IconLink aria-hidden="true" />
                Preview material changes
              </Button>
            </form>
          </section>
        </div>
        {actionData ? (
          <section aria-live="polite" className={s.preview}>
            <h2>Approval preview</h2>
            {actionData.valid ? (
              <>
                <p>
                  This change passed authoritative validation. Review the
                  selected links, then save the new immutable snapshot.
                </p>
                <Form method="post">
                  <input
                    name="baseDigest"
                    type="hidden"
                    value={snapshotDigest}
                  />
                  <input
                    name="candidateJson"
                    type="hidden"
                    value={actionData.canonicalJson}
                  />
                  <Button name="intent" type="submit" value="accept">
                    <IconCheck aria-hidden="true" />
                    Approve and save
                  </Button>
                </Form>
              </>
            ) : (
              <div role="alert">
                <ul>
                  {actionData.diagnostics.map((item) => (
                    <li key={`${item.code}:${item.path}`}>
                      <strong>{item.code}</strong> {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}
        <section className={s.inventory}>
          <h2>Current knowledge context</h2>
          <div className={s.layout}>
            <div>
              <h3>Sources</h3>
              {corpus.sources.length ? (
                corpus.sources.map((source) => (
                  <article key={`${source.id}:${source.revision}`}>
                    <strong>{source.title}</strong>
                    <small>Revision {source.revision}</small>
                    <p>{source.content}</p>
                  </article>
                ))
              ) : (
                <p>No sources yet.</p>
              )}
            </div>
            <div>
              <h3>Materials</h3>
              {corpus.materials.length ? (
                corpus.materials.map((material) => (
                  <article key={`${material.id}:${material.revision}`}>
                    <strong>Material</strong>
                    <small>
                      Revision {material.revision} · {material.sources.length}{" "}
                      sources
                    </small>
                    <p>{material.content.join(" ")}</p>
                  </article>
                ))
              ) : (
                <p>No materials yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
