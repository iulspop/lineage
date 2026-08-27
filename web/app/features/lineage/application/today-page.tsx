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
    dueCount: number
    nextReviewAt: string | null
    recentReviews: Array<{
      assessment: string
      corpusId: string
      promptId: string
      reviewedAt: string
    }>
    totalMemories: number
    workspace: {
      collectionCount: number
      corpusId: string
      sourceCount: number
    } | null
  }
  userEmail: string
}

export function TodayPage({ summary, userEmail }: TodayPageProps) {
  const workspace = summary.workspace

  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          description="Your learning workspace, ready for the next useful step."
          eyebrow="Today"
          title={
            workspace
              ? "Keep your knowledge in motion"
              : "Create your first workspace"
          }
        />

        {!workspace ? (
          <section className={s.onboarding}>
            <div className={s.onboardingIcon}>
              <IconBrain aria-hidden="true" />
            </div>
            <div className={s.onboardingCopy}>
              <h2>Create knowledge you can keep</h2>
              <p>
                Create a workspace for your long-lived knowledge, or import an
                existing Lineage archive. Everyday capture, review, and browsing
                will stay inside that active workspace.
              </p>
            </div>
            <div className={s.actions}>
              <Link className={s.primaryAction} to="/settings/workspace">
                <IconPlus aria-hidden="true" />
                Create workspace
              </Link>
              <Link className={s.secondaryAction} to="/create/archive">
                Import workspace
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

            <section aria-label="Workspace summary" className={s.stats}>
              <Card>
                <CardHeader>
                  <CardDescription>Active workspace</CardDescription>
                  <CardTitle>{workspace.corpusId}</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.totalMemories} active memories ·{" "}
                  {workspace.collectionCount} collections ·{" "}
                  {workspace.sourceCount} sources
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Recent activity</CardDescription>
                  <CardTitle>{summary.recentReviews.length} reviews</CardTitle>
                </CardHeader>
                <CardContent>Most recent reviews in this workspace</CardContent>
              </Card>
            </section>

            <section className={s.section}>
              <div className={s.sectionHeading}>
                <div>
                  <span className={s.eyebrow}>Library</span>
                  <h2>Browse your workspace</h2>
                </div>
                <Link className={s.textLink} to="/library">
                  Open library <IconArrowRight aria-hidden="true" />
                </Link>
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
