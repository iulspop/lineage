import { data } from "react-router"

import type { Route } from "./+types/review"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import {
  completeReview,
  loadReview,
  loadReviewProgress,
  resolveReview,
} from "~/features/lineage/application/review-flow.server"
import { ReviewPage } from "~/features/lineage/application/review-page"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { reviewCore } from "~/features/lineage/infrastructure/review-core.server"
import { reviewRecordStore } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const review = await loadReview({
    core: reviewCore,
    reviewStore: reviewRecordStore,
    snapshotStore: corpusSnapshotStore,
    userId,
    validator: lineageRuntime,
  })
  const [progress, user] = await Promise.all([
    loadReviewProgress({
      corpusId: review.corpusId,
      promptId: review.prompt.id,
      store: reviewRecordStore,
      userId,
    }),
    retrieveUserFromDatabaseById(userId),
  ])
  return { ...review, ...progress, userEmail: user?.email ?? "" }
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const intent = formData.get("intent")
  const review = await loadReview({
    core: reviewCore,
    reviewStore: reviewRecordStore,
    snapshotStore: corpusSnapshotStore,
    userId,
    validator: lineageRuntime,
  })
  const attempt =
    typeof formData.get("attempt") === "string"
      ? String(formData.get("attempt"))
      : null

  if (intent === "resolve") {
    return data({
      completed: false as const,
      ...resolveReview({ attempt, core: reviewCore, prompt: review.prompt }),
    })
  }

  if (intent === "assess") {
    const completed = await completeReview({
      assessment: formData.get("assessment"),
      attempt,
      core: reviewCore,
      corpusId: review.corpusId,
      prompt: review.prompt,
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
