import { data, redirect } from "react-router"

import type { Route } from "./+types/library.$corpusId.memories.$promptId"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { MemoryDetailPage } from "~/features/lineage/application/memory-detail-page"
import { projectMemoryDetail } from "~/features/lineage/application/memory-detail-projection"
import {
  StaleCorpusSnapshotError,
  updateMemoryStatus,
} from "~/features/lineage/application/update-memory-status.server"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import {
  corpusSnapshotStore,
  listCorpusSnapshotRevisions,
} from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { listCorpusReviewHistory } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ params, request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const { corpusId, promptId } = params
  const snapshot = await corpusSnapshotStore.latest(userId, corpusId)
  if (!snapshot) throw data("Corpus not found", { status: 404 })

  const [reviews, snapshots, user] = await Promise.all([
    listCorpusReviewHistory({ corpusId, promptId, userId }),
    listCorpusSnapshotRevisions(userId, corpusId),
    retrieveUserFromDatabaseById(userId),
  ])
  const projection = projectMemoryDetail({
    document: parseCorpusDocument(JSON.parse(snapshot.canonicalJson)),
    promptId,
    reviews,
    snapshotDigest: snapshot.digest,
    snapshots,
  })
  if (!projection) throw data("Memory not found", { status: 404 })

  return { ...projection, userEmail: user?.email ?? "" }
}

export async function action({ params, request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const formData = await request.formData()
  const status = formData.get("status")
  const baseDigest = formData.get("baseDigest")
  if (
    (status !== "active" && status !== "suspended") ||
    typeof baseDigest !== "string"
  )
    return data({ error: "Invalid memory status action" }, { status: 400 })

  let updated: Awaited<ReturnType<typeof updateMemoryStatus>>
  try {
    updated = await updateMemoryStatus({
      baseDigest,
      corpusId: params.corpusId,
      ownerId,
      promptId: params.promptId,
      status,
      store: corpusSnapshotStore,
      validator: lineageRuntime,
    })
  } catch (error) {
    if (error instanceof StaleCorpusSnapshotError)
      return data({ error: error.message }, { status: 409 })
    throw error
  }
  if (!updated) throw data("Memory not found", { status: 404 })
  throw redirect(
    `/library/${encodeURIComponent(params.corpusId)}/memories/${encodeURIComponent(params.promptId)}`,
  )
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: `${loaderData?.memory.promptId ?? "Memory"} | Lineage` },
]

export default function MemoryDetailRoute({
  loaderData,
}: Route.ComponentProps) {
  return <MemoryDetailPage {...loaderData} />
}
