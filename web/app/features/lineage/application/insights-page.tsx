import { Link } from "react-router"

import * as s from "./insights-page.css"
import type { InsightsProjection } from "./insights-projection"
import { AppShell } from "~/components/app-shell/app-shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { PageHeader } from "~/components/ui/page-header"

export type InsightsPageProps = {
  insights: InsightsProjection
  query: { assessment: string; corpusId: string }
  userEmail: string
}

function label(value: string) {
  return value.replaceAll(/[-_]+/g, " ")
}

function interval(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`
  return `${Math.round(minutes / 1440)}d`
}

export function InsightsPage({
  insights,
  query,
  userEmail,
}: InsightsPageProps) {
  const timeline = insights.timeline.filter(
    (review) =>
      (!query.corpusId || review.corpusId === query.corpusId) &&
      (!query.assessment || review.assessment === query.assessment),
  )
  const maxDay = Math.max(1, ...insights.dailyActivity.map((day) => day.count))

  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          description="Derived from your append-only review history and current schedules. Nothing here becomes durable corpus truth."
          eyebrow="Insights"
          title="Understand your learning workload"
        />

        <section aria-label="Learning summary" className={s.summaryGrid}>
          <Card>
            <CardHeader>
              <CardDescription>Due now</CardDescription>
              <CardTitle>{insights.summary.dueNow}</CardTitle>
            </CardHeader>
            <CardContent>active memories ready for review</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Last 7 days</CardDescription>
              <CardTitle>{insights.summary.reviewedLast7Days}</CardTitle>
            </CardHeader>
            <CardContent>completed reviews</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>All history</CardDescription>
              <CardTitle>{insights.summary.totalReviews}</CardTitle>
            </CardHeader>
            <CardContent>append-only review events</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Library</CardDescription>
              <CardTitle>{insights.summary.activeMemories}</CardTitle>
            </CardHeader>
            <CardContent>active memories</CardContent>
          </Card>
        </section>

        <section className={s.panel}>
          <div className={s.panelHeading}>
            <div>
              <span className={s.eyebrow}>Activity</span>
              <h2>Seven-day rhythm</h2>
            </div>
          </div>
          <div
            aria-label="Reviews completed by day"
            className={s.chart}
            role="img"
          >
            {insights.dailyActivity.map((day) => (
              <div className={s.barColumn} key={day.date}>
                <span className={s.barValue}>{day.count}</span>
                <span
                  className={s.bar}
                  style={{
                    height: `${Math.max(8, (day.count / maxDay) * 120)}px`,
                  }}
                />
                <span>
                  {new Intl.DateTimeFormat("en", {
                    timeZone: "UTC",
                    weekday: "short",
                  }).format(new Date(`${day.date}T12:00:00Z`))}
                </span>
              </div>
            ))}
          </div>
          <table className={s.srTable}>
            <caption>Reviews completed by day</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {insights.dailyActivity.map((day) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={s.twoColumn}>
          <div className={s.panel}>
            <div className={s.panelHeading}>
              <div>
                <span className={s.eyebrow}>Workload</span>
                <h2>By corpus</h2>
              </div>
            </div>
            <div className={s.stack}>
              {insights.corpusWorkload.map((corpus) => (
                <Link
                  className={s.rowLink}
                  key={corpus.corpusId}
                  to={`/library/${encodeURIComponent(corpus.corpusId)}`}
                >
                  <span>
                    <strong>{label(corpus.corpusId)}</strong>
                    <small>
                      {corpus.memories} memories · {corpus.reviews} reviews
                    </small>
                  </span>
                  <span>{corpus.due} due</span>
                </Link>
              ))}
            </div>
          </div>
          <div className={s.panel}>
            <div className={s.panelHeading}>
              <div>
                <span className={s.eyebrow}>Attention</span>
                <h2>Difficult memories</h2>
              </div>
            </div>
            {insights.difficultMemories.length ? (
              <div className={s.stack}>
                {insights.difficultMemories.map((memory) => (
                  <Link
                    className={s.rowLink}
                    key={`${memory.corpusId}:${memory.promptId}`}
                    to={`/library/${encodeURIComponent(memory.corpusId)}/memories/${encodeURIComponent(memory.promptId)}`}
                  >
                    <span>
                      <strong>{label(memory.promptId)}</strong>
                      <small>
                        {label(memory.corpusId)} · {memory.total} reviews
                      </small>
                    </span>
                    <span>
                      {memory.again} again · {memory.hard} hard
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={s.empty}>No difficult memories yet.</p>
            )}
          </div>
        </section>

        <section className={s.panel}>
          <div className={s.panelHeading}>
            <div>
              <span className={s.eyebrow}>History</span>
              <h2>Complete review timeline</h2>
            </div>
          </div>
          <form className={s.filters} method="get">
            <label>
              Corpus
              <select defaultValue={query.corpusId} name="corpusId">
                <option value="">All corpora</option>
                {insights.corpusWorkload.map((corpus) => (
                  <option key={corpus.corpusId} value={corpus.corpusId}>
                    {label(corpus.corpusId)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rating
              <select defaultValue={query.assessment} name="assessment">
                <option value="">All ratings</option>
                {["again", "hard", "good", "easy"].map((rating) => (
                  <option key={rating} value={rating}>
                    {label(rating)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Apply filters</button>
          </form>
          {timeline.length ? (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Reviewed</th>
                    <th>Memory</th>
                    <th>Rating</th>
                    <th>Next interval</th>
                    <th>Scheduler</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((review) => (
                    <tr key={review.id}>
                      <td>
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(review.reviewedAt))}
                      </td>
                      <td>
                        <Link
                          to={`/library/${encodeURIComponent(review.corpusId)}/memories/${encodeURIComponent(review.promptId)}`}
                        >
                          {label(review.promptId)}
                        </Link>
                        <small>
                          {label(review.corpusId)} · revision{" "}
                          {review.promptRevision}
                        </small>
                      </td>
                      <td>
                        <span className={s.rating}>{review.assessment}</span>
                      </td>
                      <td>{interval(review.nextIntervalMinutes)}</td>
                      <td>
                        {review.scheduler} {review.schedulerVersion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={s.empty}>No reviews match these filters.</p>
          )}
        </section>
      </div>
    </AppShell>
  )
}
