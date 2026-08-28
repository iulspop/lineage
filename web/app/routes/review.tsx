import { data, redirect } from "react-router"

import type { Route } from "./+types/review"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import type { ManualMemoryDraft } from "~/features/lineage/application/manual-memory-draft"
import {
  completeReview,
  loadReview,
  loadReviewProgress,
  loadReviewPrompt,
  resolveReview,
} from "~/features/lineage/application/review-flow.server"
import { ReviewPage } from "~/features/lineage/application/review-page"
import {
  acceptMemoryRevision,
  previewMemoryRevision,
} from "~/features/lineage/application/revise-memory.server"
import { StaleCorpusSnapshotError } from "~/features/lineage/application/update-memory-status.server"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { reviewCore } from "~/features/lineage/infrastructure/review-core.server"
import { reviewRecordStore } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const resolution = await resolveActiveCorpus(userId)
  if (resolution.status === "empty") throw redirect("/settings/workspace")

  const searchParams = new URL(request.url).searchParams
  const requestedLimit = Number(searchParams.get("limit"))
  const sessionLimit = [10, 20, 50].includes(requestedLimit)
    ? requestedLimit
    : null
  const requestedCompleted = Number(searchParams.get("completed"))
  const sessionCompleted =
    Number.isInteger(requestedCompleted) && requestedCompleted > 0
      ? requestedCompleted
      : 0
  const corpusId = resolution.corpusId
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
  return {
    ...review,
    ...progress,
    sessionCompleted,
    sessionLimit,
    userEmail: user?.email ?? "",
  }
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request)
  const resolution = await resolveActiveCorpus(userId)
  if (resolution.status === "empty") {
    return data({ error: "No active workspace is available" }, { status: 409 })
  }
  const formData = await request.formData()
  const intent = formData.get("intent")
  const corpusId = formData.get("corpusId")
  if (typeof corpusId !== "string" || !corpusId) {
    return data({ error: "A review workspace is required" }, { status: 400 })
  }
  if (corpusId !== resolution.corpusId) {
    return data(
      { error: "Your active workspace changed. Reload review to continue." },
      { status: 409 },
    )
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

  if (intent === "revise") {
    if (prompt.kind !== "basic" && prompt.kind !== "cloze")
      return data(
        { error: "Quick edit is available for basic and cloze memories." },
        { status: 400 },
      )
    const document = parseCorpusDocument(
      JSON.parse(resolution.snapshot.canonicalJson),
    )
    const draft: ManualMemoryDraft = {
      answer: String(formData.get("answer") ?? ""),
      challenge: String(formData.get("challenge") ?? ""),
      collectionIds: document.collectionMemberships
        .filter(({ promptId: memberPromptId }) => memberPromptId === prompt.id)
        .map(({ collectionId }) => collectionId),
      corpusId,
      hint: prompt.clozeTargets?.[0]?.hints?.[0] ?? "",
      kind: prompt.kind,
      promptId: prompt.id,
      responseMode: prompt.response === "text" ? "text" : "self-check",
    }
    try {
      const preview = await previewMemoryRevision({
        baseDigest: snapshotDigest,
        corpusId,
        draft,
        ownerId: userId,
        promptId,
        store: corpusSnapshotStore,
        validator: lineageRuntime,
      })
      if (!preview) throw data("Memory not found", { status: 404 })
      if (!preview.valid)
        return data(
          {
            error:
              preview.diagnostics[0]?.message ??
              "The revision does not satisfy the review contract.",
          },
          { status: 400 },
        )
      await acceptMemoryRevision({
        baseDigest: snapshotDigest,
        candidateJson: preview.preview.canonicalJson,
        corpusId,
        ownerId: userId,
        store: corpusSnapshotStore,
        validator: lineageRuntime,
      })
      const search = new URL(request.url).search
      throw redirect(`/review${search}`)
    } catch (error) {
      if (error instanceof StaleCorpusSnapshotError)
        return data({ error: error.message }, { status: 409 })
      throw error
    }
  }

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
