import { data, redirect } from "react-router"

import type { Route } from "./+types/review"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import {
  completeReview,
  listReviewCorpora,
  loadReview,
  loadReviewProgress,
  loadReviewPrompt,
  resolveReview,
} from "~/features/lineage/application/review-flow.server"
import { ReviewPage } from "~/features/lineage/application/review-page"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { reviewCore } from "~/features/lineage/infrastructure/review-core.server"
import { reviewRecordStore } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const corpora = await listReviewCorpora({
    snapshotStore: corpusSnapshotStore,
    userId,
  })
  if (corpora.length === 0) throw redirect("/corpora")

  const requestedCorpusId = new URL(request.url).searchParams.get("corpusId")
  const corpusId = corpora.some(
    (corpus) => corpus.corpusId === requestedCorpusId,
  )
    ? (requestedCorpusId as string)
    : corpora[0].corpusId
  const review = await loadReview({
    core: reviewCore,
    corpusId,
    reviewStore: reviewRecordStore,
    snapshotStore: corpusSnapshotStore,
    userId,
  })
  const [progress, user] = await Promise.all([
    loadReviewProgress({
      corpusId: review.corpusId,
      nextDueAt: review.queueDueAt ? new Date(review.queueDueAt) : null,
      promptId: review.prompt?.id ?? null,
      store: reviewRecordStore,
      userId,
    }),
    retrieveUserFromDatabaseById(userId),
  ])
  return { ...review, ...progress, corpora, userEmail: user?.email ?? "" }
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const intent = formData.get("intent")
  const corpusId = formData.get("corpusId")
  if (typeof corpusId !== "string" || !corpusId) {
    return data({ error: "A review corpus is required" }, { status: 400 })
  }
  const promptId = formData.get("promptId")
  const promptRevision = Number(formData.get("promptRevision"))
  const snapshotDigest = formData.get("snapshotDigest")
  if (
    typeof promptId !== "string" ||
    !promptId ||
    typeof snapshotDigest !== "string" ||
    !snapshotDigest ||
    !Number.isInteger(promptRevision) ||
    promptRevision < 1
  ) {
    return data({ error: "A valid review Prompt is required" }, { status: 400 })
  }
  const prompt = await loadReviewPrompt({
    corpusId,
    promptId,
    promptRevision,
    snapshotDigest,
    snapshotStore: corpusSnapshotStore,
    userId,
  })
  if (!prompt) {
    return data(
      { error: "This review Prompt is no longer available" },
      { status: 409 },
    )
  }
  const attempt =
    typeof formData.get("attempt") === "string"
      ? String(formData.get("attempt"))
      : null

  if (intent === "resolve") {
    return data({
      completed: false as const,
      ...resolveReview({ attempt, core: reviewCore, prompt }),
    })
  }

  if (intent === "assess") {
    const reviewedAt = new Date(String(formData.get("reviewedAt")))
    if (Number.isNaN(reviewedAt.getTime())) {
      return data({ error: "A valid review time is required" }, { status: 400 })
    }
    const completed = await completeReview({
      assessment: formData.get("assessment"),
      attempt,
      core: reviewCore,
      corpusId,
      prompt,
      reviewedAt,
      store: reviewRecordStore,
      userId,
    })
    return data({ completed: true as const, ...completed })
  }

  return data({ error: "Unknown review action" }, { status: 400 })
}

export const meta: Route.MetaFunction = () => [{ title: "Review | Lineage" }]

export default function ReviewRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return <ReviewPage actionData={actionData} loaderData={loaderData} />
}
