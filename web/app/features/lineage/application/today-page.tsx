import {
  IconArrowRight,
  IconBrain,
  IconClock,
  IconPlus,
  IconSparkles,
} from "@tabler/icons-react"
import { Link } from "react-router"

import * as s from "./today-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { PageHeader } from "~/components/ui/page-header"

export type TodayPageProps = {
  summary: {
    corpora: Array<{ corpusId: string; dueCount: number; promptCount: number }>
    dueCount: number
    nextReviewAt: string | null
    recentReviews: Array<{
      assessment: string
      corpusId: string
      promptId: string
      reviewedAt: string
    }>
    totalMemories: number
  }
  userEmail: string
}

function formatCorpusName(corpusId: string) {
  return corpusId.replaceAll(/[-_]+/g, " ")
}

export function TodayPage({ summary, userEmail }: TodayPageProps) {
  const hasLibrary = summary.corpora.length > 0

  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          description="Your learning workspace, ready for the next useful step."
          eyebrow="Today"
          title={
            hasLibrary
              ? "Keep your knowledge in motion"
              : "Start your memory library"
          }
        />

        {!hasLibrary ? (
          <section className={s.onboarding}>
            <div className={s.onboardingIcon}>
              <IconBrain aria-hidden="true" />
            </div>
            <div className={s.onboardingCopy}>
              <h2>Create knowledge you can keep</h2>
              <p>
                Add your first corpus manually, generate a candidate with AI, or
                import an existing Lineage document. You will always preview and
                approve content before it becomes durable.
              </p>
            </div>
            <div className={s.actions}>
              <Link className={s.primaryAction} to="/create">
                <IconPlus aria-hidden="true" />
                Create memories
              </Link>
              <Link className={s.secondaryAction} to="/create/archive">
                Import a corpus
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className={s.reviewHero}>
              <div>
                <span className={s.heroLabel}>Ready to review</span>
                <strong className={s.dueCount}>{summary.dueCount}</strong>
                <p className={s.heroSupporting}>
                  {summary.dueCount === 1
                    ? "memory is due"
                    : "memories are due"}
                </p>
              </div>
              {summary.dueCount > 0 ? (
                <Link className={s.primaryAction} to="/review">
                  Start review
                  <IconArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <div className={s.nextReview}>
                  <IconClock aria-hidden="true" />
                  {summary.nextReviewAt
                    ? `Next review ${new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(summary.nextReviewAt))}`
                    : "Nothing else scheduled yet"}
                </div>
              )}
            </section>

            <section aria-label="Library summary" className={s.stats}>
              <Card>
                <CardHeader>
                  <CardDescription>Library</CardDescription>
                  <CardTitle>{summary.corpora.length} corpora</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.totalMemories} active memories
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Recent activity</CardDescription>
                  <CardTitle>{summary.recentReviews.length} reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  Most recent sessions across your library
                </CardContent>
              </Card>
            </section>

            <section className={s.section}>
              <div className={s.sectionHeading}>
                <div>
                  <span className={s.eyebrow}>Library</span>
                  <h2>Continue learning</h2>
                </div>
                <Link className={s.textLink} to="/library">
                  View library <IconArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className={s.corpusGrid}>
                {summary.corpora.slice(0, 3).map((corpus) => (
                  <Link
                    className={s.corpusCard}
                    key={corpus.corpusId}
                    to={`/library/${encodeURIComponent(corpus.corpusId)}`}
                  >
                    <span className={s.corpusTitle}>
                      {formatCorpusName(corpus.corpusId)}
                    </span>
                    <span className={s.corpusMeta}>
                      {corpus.promptCount} memories · {corpus.dueCount} due
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section aria-label="Quick actions" className={s.quickActions}>
              <Link to="/create">
                <IconPlus aria-hidden="true" />
                Create memory
              </Link>
              <Link to="/create/ai">
                <IconSparkles aria-hidden="true" />
                Generate with AI
              </Link>
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
