import { IconArrowLeft, IconEye, IconPlayerPlay } from "@tabler/icons-react"
import { useState } from "react"
import { Form, Link } from "react-router"

import * as s from "./memory-detail-page.css"
import type { MemoryDetailProjection } from "./memory-detail-projection"
import { AppShell } from "~/components/app-shell/app-shell"
import { PageHeader } from "~/components/ui/page-header"

type Props = MemoryDetailProjection & { userEmail: string }

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function MemoryDetailPage(props: Props) {
  const [revealed, setRevealed] = useState(false)
  const memory = props.memory

  return (
    <AppShell userEmail={props.userEmail}>
      <div className={s.page}>
        <Link
          className={s.back}
          to={`/library/${encodeURIComponent(props.corpusId)}?tab=memories`}
        >
          <IconArrowLeft aria-hidden="true" /> Back to memories
        </Link>
        <PageHeader
          actions={
            <div className={s.actions}>
              <Form method="post">
                <input
                  name="baseDigest"
                  type="hidden"
                  value={props.snapshotDigest}
                />
                <input
                  name="status"
                  type="hidden"
                  value={memory.status === "suspended" ? "active" : "suspended"}
                />
                <button className={s.secondaryAction} type="submit">
                  {memory.status === "suspended" ? "Reactivate" : "Suspend"}
                </button>
              </Form>
              <Link
                className={s.primaryAction}
                to={`/review?corpusId=${encodeURIComponent(props.corpusId)}`}
              >
                <IconPlayerPlay aria-hidden="true" /> Review corpus
              </Link>
            </div>
          }
          description={`${memory.kind} · revision ${memory.revision} · ${memory.status}`}
          eyebrow="Memory"
          title={memory.promptId}
        />

        <section aria-label="Memory preview" className={s.reviewCard}>
          <div className={s.meta}>
            <span>{memory.responseMode}</span>
            <span>
              {memory.withheldCount} concealed item
              {memory.withheldCount === 1 ? "" : "s"}
            </span>
            <span>
              {memory.due
                ? "Due now"
                : memory.nextReviewAt
                  ? `Due ${formatDate(memory.nextReviewAt)}`
                  : "Not scheduled"}
            </span>
          </div>
          <div className={s.presentation}>
            <span className={s.eyebrow}>Challenge</span>
            {memory.challenge.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {!revealed ? (
            <button
              className={s.reveal}
              onClick={() => setRevealed(true)}
              type="button"
            >
              <IconEye aria-hidden="true" /> Reveal resolution
            </button>
          ) : (
            <div aria-live="polite" className={s.resolution}>
              <span className={s.eyebrow}>Resolution</span>
              {memory.resolution.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}
        </section>

        <div className={s.grid}>
          <section className={s.panel}>
            <h2>Scheduling</h2>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{memory.due ? "Due now" : "Not due"}</dd>
              </div>
              <div>
                <dt>Next review</dt>
                <dd>
                  {memory.nextReviewAt
                    ? formatDate(memory.nextReviewAt)
                    : "Unscheduled"}
                </dd>
              </div>
              <div>
                <dt>Reviews</dt>
                <dd>{props.history.length}</dd>
              </div>
            </dl>
          </section>
          <section className={s.panel}>
            <h2>Revision history</h2>
            {props.revisions.length === 0 ? (
              <p>No prior snapshots contain this memory.</p>
            ) : (
              <ol className={s.list}>
                {props.revisions.map((revision) => (
                  <li key={revision.digest}>
                    <strong>Revision {revision.revision}</strong>
                    <span>
                      {formatDate(revision.createdAt)} ·{" "}
                      {revision.digest.slice(0, 12)}…
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <section className={s.panel}>
          <h2>Sources and dependencies</h2>
          {props.sources.length +
            props.materials.length +
            props.assets.length ===
          0 ? (
            <p>No linked sources, materials, or assets.</p>
          ) : (
            <div className={s.dependencies}>
              {props.sources.map((source) => (
                <article key={source.id}>
                  <span className={s.eyebrow}>Source</span>
                  <h3>{source.title}</h3>
                  <p>{source.contentPreview}</p>
                  <code>
                    {source.id} · revision {source.revision}
                  </code>
                </article>
              ))}
              {props.materials.map((material) => (
                <article key={material.id}>
                  <span className={s.eyebrow}>Material</span>
                  <h3>{material.id}</h3>
                  <p>{material.content}</p>
                  <code>revision {material.revision}</code>
                </article>
              ))}
              {props.assets.map((asset) => (
                <article key={asset.id}>
                  <span className={s.eyebrow}>Asset</span>
                  <h3>{asset.id}</h3>
                  <p>
                    {asset.accessibleDescription ??
                      "No accessibility description"}
                  </p>
                  <code>{asset.mediaType}</code>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className={s.grid}>
          <section className={s.panel}>
            <h2>Relationships</h2>
            {props.relationships.length === 0 ? (
              <p>No relationships.</p>
            ) : (
              <ul className={s.list}>
                {props.relationships.map((relationship) => (
                  <li key={relationship.id}>
                    <strong>{relationship.kind}</strong>
                    <span>
                      {relationship.direction} · {relationship.relatedId}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className={s.panel}>
            <h2>Review history</h2>
            {props.history.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <ol className={s.list}>
                {props.history.map((review) => (
                  <li key={review.id}>
                    <strong>{review.assessment}</strong>
                    <span>
                      {formatDate(review.reviewedAt)} · revision{" "}
                      {review.promptRevision} · {review.intervalMinutes} min
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  )
}
