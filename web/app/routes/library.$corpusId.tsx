import { redirect } from "react-router"

import type { Route } from "./+types/library.$corpusId"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import { projectCorpusBrowse } from "~/features/lineage/application/corpus-browse-projection"
import { CorpusDetailPage } from "~/features/lineage/application/corpus-detail-page"
import {
  listRestorableDeletedMemories,
  restoreDeletedMemory,
} from "~/features/lineage/application/delete-memory.server"
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
  const corpusId = params.corpusId
  const resolution = await resolveActiveCorpus(userId)
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  if (corpusId !== resolution.corpusId) throw redirect("/library")
  const snapshot = resolution.snapshot

  const url = new URL(request.url)
  const [user, reviews, snapshots] = await Promise.all([
    retrieveUserFromDatabaseById(userId),
    listCorpusReviewHistory({ corpusId, limit: 100, userId }),
    listCorpusSnapshotRevisions(userId, corpusId),
  ])
  const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const projection = projectCorpusBrowse({
    canonicalJson: snapshot.canonicalJson,
    document,
    reviews,
    revisions: snapshots.map((revision) => ({
      createdAt: revision.createdAt.toISOString(),
      digest: revision.digest,
      formatVersion: revision.formatVersion,
      memoryCount: parseCorpusDocument(JSON.parse(revision.canonicalJson))
        .prompts.length,
    })),
    snapshotDigest: snapshot.digest,
  })

  return {
    ...projection,
    advanced: { ...projection.advanced, canonicalJson: "" },
    collectionMemberships: document.collectionMemberships,
    collections: document.collections,
    deletedMemories: listRestorableDeletedMemories(document, new Date()).map(
      ({ deletedAt, prompt, restoreUntil }) => ({
        challenge: prompt.challenge,
        deletedAt,
        promptId: prompt.id,
        restoreUntil,
      }),
    ),
    filters: {
      collection: url.searchParams.get("collection") ?? "all",
      due: url.searchParams.get("due") ?? "all",
      kind: url.searchParams.get("kind") ?? "all",
      query: url.searchParams.get("q")?.trim() ?? "",
      source: url.searchParams.get("source") ?? "all",
      status: url.searchParams.get("status") ?? "all",
    },
    tab: url.searchParams.get("tab") ?? "overview",
    userEmail: user?.email ?? "",
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const userId = await requireUserId(request)
  const resolution = await resolveActiveCorpus(userId)
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  if (params.corpusId !== resolution.corpusId) throw redirect("/library")

  const formData = await request.formData()
  if (formData.get("intent") !== "restore")
    throw new Response("Unsupported action", { status: 400 })
  const promptId = formData.get("promptId")
  const baseDigest = formData.get("snapshotDigest")
  if (typeof promptId !== "string" || typeof baseDigest !== "string")
    throw new Response("Invalid restoration request", { status: 400 })

  const restored = await restoreDeletedMemory({
    baseDigest,
    corpusId: resolution.corpusId,
    now: new Date(),
    ownerId: userId,
    promptId,
    store: corpusSnapshotStore,
    validator: lineageRuntime,
  })
  if (!restored)
    throw new Response("This Memory can no longer be restored", { status: 410 })
  throw redirect(`?tab=deleted`)
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: `${loaderData?.corpus.corpusId ?? "Corpus"} | Lineage` },
]

export default function CorpusDetailRoute({
  loaderData,
}: Route.ComponentProps) {
  return <CorpusDetailPage {...loaderData} />
}
