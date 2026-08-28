import {
  IconArrowLeft,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Form, Link, useFetcher } from "react-router"

import type { CorpusBrowseProjection } from "./corpus-browse-projection"
import * as s from "./corpus-detail-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { PageHeader } from "~/components/ui/page-header"
import { formatDateTime, useTimeZone } from "~/utils/time-zone"

const tabs = ["overview", "memories", "sources", "history", "advanced"] as const

type CorpusDetailPageProps = CorpusBrowseProjection & {
  collectionMemberships: Array<{ collectionId: string; promptId: string }>
  collections: Array<{
    description?: string
    id: string
    parentId?: string
    title: string
  }>
  filters: {
    collection: string
    due: string
    kind: string
    query: string
    source: string
    status: string
  }
  tab: string
  userEmail: string
}

export function CorpusDetailPage(props: CorpusDetailPageProps) {
  const disclosureFetcher = useFetcher<{
    answers?: Record<string, string[]>
    canonicalJson?: string
    error?: string
  }>()
  const [canonicalJson, setCanonicalJson] = useState<string | null>(null)
  const [revealedAnswers, setRevealedAnswers] = useState<
    Record<string, string[]>
  >({})
  const timeZone = useTimeZone()
  const activeTab = tabs.includes(props.tab as (typeof tabs)[number])
    ? props.tab
    : "overview"
  const query = props.filters.query.toLocaleLowerCase()
  const membershipsByPrompt = new Map<string, Set<string>>()
  for (const membership of props.collectionMemberships) {
    const memberships =
      membershipsByPrompt.get(membership.promptId) ?? new Set()
    memberships.add(membership.collectionId)
    membershipsByPrompt.set(membership.promptId, memberships)
  }
  const memories = props.memories.filter((memory) => {
    if (
      query &&
      !`${memory.challenge} ${memory.promptId}`
        .toLocaleLowerCase()
        .includes(query)
    )
      return false
    if (props.filters.kind !== "all" && memory.kind !== props.filters.kind)
      return false
    if (
      props.filters.status !== "all" &&
      memory.status !== props.filters.status
    )
      return false
    if (props.filters.due === "due" && !memory.due) return false
    if (
      props.filters.due === "scheduled" &&
      (memory.due || !memory.nextReviewAt)
    )
      return false
    if (
      props.filters.source !== "all" &&
      !memory.sourceIds.includes(props.filters.source)
    )
      return false
    const memberships = membershipsByPrompt.get(memory.promptId) ?? new Set()
    if (props.filters.collection === "unfiled" && memberships.size > 0)
      return false
    if (
      props.filters.collection !== "all" &&
      props.filters.collection !== "unfiled" &&
      !memberships.has(props.filters.collection)
    )
      return false
    return true
  })

  useEffect(() => {
    const answers = disclosureFetcher.data?.answers
    if (answers) setRevealedAnswers((current) => ({ ...current, ...answers }))
    if (disclosureFetcher.data?.canonicalJson)
      setCanonicalJson(disclosureFetcher.data.canonicalJson)
  }, [disclosureFetcher.data])

  function requestDisclosure(formData: FormData) {
    formData.set("snapshotDigest", props.advanced.digest)
    disclosureFetcher.submit(formData, {
      action: `/library/${encodeURIComponent(props.corpus.corpusId)}/disclosure`,
      method: "post",
    })
  }

  function revealAnswers(promptIds: string[]) {
    const formData = new FormData()
    for (const promptId of promptIds) formData.append("promptId", promptId)
    requestDisclosure(formData)
  }

  function revealCanonicalJson() {
    const formData = new FormData()
    formData.set("intent", "canonical")
    requestDisclosure(formData)
  }

  function hideAnswer(promptId: string) {
    setRevealedAnswers((current) => {
      const next = { ...current }
      delete next[promptId]
      return next
    })
  }

  return (
    <AppShell userEmail={props.userEmail}>
      <div className={s.page}>
        <Link className={s.back} to="/library">
          <IconArrowLeft aria-hidden="true" /> Library
        </Link>
        <PageHeader
          actions={
            <div className={s.actions}>
              <Link
                className={s.secondaryAction}
                to={`/create/ai?intent=expand-corpus&corpusId=${encodeURIComponent(props.corpus.corpusId)}&topic=${encodeURIComponent(`Expand ${props.corpus.corpusId}`)}`}
              >
                <IconSparkles aria-hidden="true" /> Generate memories
              </Link>
              <a
                className={s.primaryAction}
                href={`/library/${encodeURIComponent(props.corpus.corpusId)}/archive`}
              >
                <IconDownload aria-hidden="true" /> Export .lineage
              </a>
            </div>
          }
          description={`${props.corpus.memoryCount} memories · ${props.corpus.sourceCount} sources · ${props.corpus.assetCount} assets`}
          eyebrow="Workspace"
          title={props.corpus.corpusId.replaceAll(/[-_]+/g, " ")}
        />
        <nav aria-label="Workspace sections" className={s.tabs}>
          {tabs.map((tab) => (
            <Link
              aria-current={activeTab === tab ? "page" : undefined}
              className={activeTab === tab ? s.activeTab : s.tab}
              key={tab}
              to={`?tab=${tab}`}
            >
              {tab}
            </Link>
          ))}
        </nav>

        {activeTab === "overview" && (
          <>
            <section aria-label="Corpus summary" className={s.summary}>
              <div>
                <span>Memories</span>
                <strong>{props.corpus.memoryCount}</strong>
              </div>
              <div>
                <span>Sources</span>
                <strong>{props.corpus.sourceCount}</strong>
              </div>
              <div>
                <span>Revisions</span>
                <strong>{props.revisions.length}</strong>
              </div>
              <div>
                <span>Compatibility</span>
                <strong>{props.compatibility.status}</strong>
              </div>
            </section>
            <section className={s.panel}>
              <h2>Collections</h2>
              {props.collections.length === 0 ? (
                <p className={s.muted}>
                  No collections yet. Memories remain available in the Unfiled
                  view.
                </p>
              ) : (
                <ul className={s.cleanList}>
                  {props.collections.map((collection) => (
                    <li key={collection.id}>
                      <Link
                        to={`?tab=memories&collection=${encodeURIComponent(collection.id)}`}
                      >
                        {collection.title}
                      </Link>
                      <span>
                        {collection.parentId
                          ? `Nested under ${collection.parentId}`
                          : collection.description || "Top-level collection"}
                      </span>
                    </li>
                  ))}
                  <li>
                    <Link to="?tab=memories&collection=unfiled">Unfiled</Link>
                    <span>Memories not assigned to a collection</span>
                  </li>
                </ul>
              )}
            </section>
            <div className={s.twoColumn}>
              <section className={s.panel}>
                <h2>Recently reviewed</h2>
                {props.history.length === 0 ? (
                  <p className={s.muted}>No reviews yet.</p>
                ) : (
                  <ul className={s.cleanList}>
                    {props.history.slice(0, 5).map((review) => (
                      <li key={review.id}>
                        <Link
                          to={`/library/${encodeURIComponent(props.corpus.corpusId)}/memories/${encodeURIComponent(review.promptId)}`}
                        >
                          {review.promptId}
                        </Link>
                        <span>
                          {review.assessment} ·{" "}
                          {formatDateTime(review.reviewedAt, timeZone)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className={s.panel}>
                <h2>Snapshot timeline</h2>
                <ul className={s.cleanList}>
                  {props.revisions.slice(0, 5).map((revision) => (
                    <li key={revision.digest}>
                      <code>{revision.digest.slice(0, 12)}…</code>
                      <span>
                        {revision.memoryCount} memories ·{" "}
                        {formatDateTime(revision.createdAt, timeZone)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}

        {activeTab === "memories" && (
          <section className={s.panel}>
            <div className={s.toolbar}>
              <div>
                <span className={s.eyebrow}>Memories</span>
                <h2>Browse this workspace</h2>
              </div>
              {memories.length > 0 && (
                <div className={s.revealActions}>
                  <button
                    disabled={disclosureFetcher.state !== "idle"}
                    onClick={() =>
                      revealAnswers(memories.map((memory) => memory.promptId))
                    }
                    type="button"
                  >
                    <IconEye aria-hidden="true" /> Reveal all answers
                  </button>
                  {Object.keys(revealedAnswers).length > 0 && (
                    <button
                      onClick={() => setRevealedAnswers({})}
                      type="button"
                    >
                      <IconEyeOff aria-hidden="true" /> Hide all answers
                    </button>
                  )}
                </div>
              )}
            </div>
            {disclosureFetcher.data?.error && (
              <p role="alert">{disclosureFetcher.data.error}</p>
            )}
            <Form className={s.filters} method="get" role="search">
              <input name="tab" type="hidden" value="memories" />
              <label className={s.search}>
                <IconSearch aria-hidden="true" />
                <input
                  aria-label="Search memories"
                  defaultValue={props.filters.query}
                  name="q"
                  placeholder="Search memories"
                  type="search"
                />
              </label>
              <select
                aria-label="Memory kind"
                defaultValue={props.filters.kind}
                name="kind"
              >
                <option value="all">All kinds</option>
                <option value="basic">Basic</option>
                <option value="cloze">Cloze</option>
                <option value="image-occlusion">Image occlusion</option>
              </select>
              <select
                aria-label="Memory status"
                defaultValue={props.filters.status}
                name="status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="retired">Retired</option>
              </select>
              <select
                aria-label="Review schedule"
                defaultValue={props.filters.due}
                name="due"
              >
                <option value="all">Any schedule</option>
                <option value="due">Due now</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <select
                aria-label="Source"
                defaultValue={props.filters.source}
                name="source"
              >
                <option value="all">All sources</option>
                {props.sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.title}
                  </option>
                ))}
              </select>
              <select
                aria-label="Collection"
                defaultValue={props.filters.collection}
                name="collection"
              >
                <option value="all">All collections</option>
                <option value="unfiled">Unfiled</option>
                {props.collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title}
                  </option>
                ))}
              </select>
              <button type="submit">Apply</button>
            </Form>
            {memories.length === 0 ? (
              <p className={s.empty}>No memories match these filters.</p>
            ) : (
              <div className={s.memoryList}>
                {memories.map((memory) => {
                  const answer = revealedAnswers[memory.promptId]
                  return (
                    <article className={s.memory} key={memory.promptId}>
                      <div className={s.memoryMain}>
                        <div className={s.badges}>
                          <span>{memory.kind}</span>
                          <span>{memory.status}</span>
                          {memory.due && <span className={s.due}>due</span>}
                        </div>
                        <h3>
                          <Link
                            to={`/library/${encodeURIComponent(props.corpus.corpusId)}/memories/${encodeURIComponent(memory.promptId)}`}
                          >
                            {memory.challenge}
                          </Link>
                        </h3>
                        <code>{memory.promptId}</code>
                        {answer && (
                          <div
                            aria-live="polite"
                            className={s.memoryResolution}
                          >
                            <span className={s.eyebrow}>Answer</span>
                            {answer.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={s.memoryAside}>
                        <span className={s.revision}>
                          {memory.lastAssessment ?? "New"}
                          <br />
                          Revision {memory.revision}
                        </span>
                        {answer ? (
                          <button
                            aria-expanded="true"
                            onClick={() => hideAnswer(memory.promptId)}
                            type="button"
                          >
                            <IconEyeOff aria-hidden="true" /> Hide answer
                          </button>
                        ) : (
                          <button
                            aria-expanded="false"
                            disabled={disclosureFetcher.state !== "idle"}
                            onClick={() => revealAnswers([memory.promptId])}
                            type="button"
                          >
                            <IconEye aria-hidden="true" /> Reveal answer
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "sources" && (
          <section className={s.sectionStack}>
            <div className={s.sectionHeader}>
              <div>
                <h2>Sources and materials</h2>
                <p>
                  Maintain durable context and link it to the memories it
                  supports.
                </p>
              </div>
              <Link
                className={s.secondaryAction}
                to={`/library/${encodeURIComponent(props.corpus.corpusId)}/knowledge`}
              >
                Manage context
              </Link>
            </div>
            <div className={s.cardGrid}>
              {props.sources.length === 0 ? (
                <p className={s.empty}>This corpus has no sources.</p>
              ) : (
                props.sources.map((source) => (
                  <article
                    className={s.panel}
                    key={`${source.id}:${source.revision}`}
                  >
                    <span className={s.eyebrow}>
                      Source · revision {source.revision}
                    </span>
                    <h2>{source.title}</h2>
                    <p>
                      {source.contentPreview || "No source content preview."}
                    </p>
                    <small>
                      {source.memoryCount} linked memories · {source.assetCount}{" "}
                      assets
                    </small>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "history" && (
          <section className={s.panel}>
            <h2>Review history</h2>
            {props.history.length === 0 ? (
              <p className={s.muted}>No reviews yet.</p>
            ) : (
              <ol className={s.timeline}>
                {props.history.map((review) => (
                  <li key={review.id}>
                    <div>
                      <Link
                        to={`/library/${encodeURIComponent(props.corpus.corpusId)}/memories/${encodeURIComponent(review.promptId)}`}
                      >
                        {review.promptId}
                      </Link>
                      <strong>{review.assessment}</strong>
                    </div>
                    <span>
                      Prompt revision {review.promptRevision} ·{" "}
                      {review.intervalMinutes} minute interval ·{" "}
                      {formatDateTime(review.reviewedAt, timeZone)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {activeTab === "advanced" && (
          <div className={s.advancedGrid}>
            <section className={s.panel}>
              <h2>Compatibility</h2>
              <dl className={s.details}>
                <div>
                  <dt>Format</dt>
                  <dd>
                    {props.advanced.format} v{props.advanced.formatVersion}
                  </dd>
                </div>
                <div>
                  <dt>Digest</dt>
                  <dd>
                    <code>{props.advanced.digest}</code>
                  </dd>
                </div>
                <div>
                  <dt>Migrations</dt>
                  <dd>{props.compatibility.migrations}</dd>
                </div>
                <div>
                  <dt>Reported losses</dt>
                  <dd>{props.compatibility.losses.length}</dd>
                </div>
              </dl>
            </section>
            <section className={s.panel}>
              <h2>Extensions</h2>
              {props.compatibility.extensions.length === 0 ? (
                <p className={s.muted}>No extensions declared.</p>
              ) : (
                <ul>
                  {props.compatibility.extensions.map((extension) => (
                    <li key={extension.id}>
                      <code>{extension.id}</code> {extension.version} ·{" "}
                      {extension.requirement}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className={s.raw}>
              <h2>Canonical JSON</h2>
              <p>
                This answer-bearing durable snapshot stays withheld until you
                explicitly reveal it.
              </p>
              {canonicalJson ? (
                <>
                  <button
                    className={s.disclosureButton}
                    onClick={() => setCanonicalJson(null)}
                    type="button"
                  >
                    <IconEyeOff aria-hidden="true" /> Hide canonical JSON
                  </button>
                  <pre>{canonicalJson}</pre>
                </>
              ) : (
                <button
                  className={s.disclosureButton}
                  disabled={disclosureFetcher.state !== "idle"}
                  onClick={revealCanonicalJson}
                  type="button"
                >
                  <IconEye aria-hidden="true" /> Reveal canonical JSON
                </button>
              )}
            </section>
          </div>
        )}
      </div>
    </AppShell>
  )
}
