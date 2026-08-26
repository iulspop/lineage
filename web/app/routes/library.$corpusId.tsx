import { data } from "react-router"

import type { Route } from "./+types/library.$corpusId"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { projectCorpusBrowse } from "~/features/lineage/application/corpus-browse-projection"
import { CorpusDetailPage } from "~/features/lineage/application/corpus-detail-page"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import {
  corpusSnapshotStore,
  listCorpusSnapshotRevisions,
} from "~/features/lineage/infrastructure/corpus-model.server"
import { listCorpusReviewHistory } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ params, request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const corpusId = params.corpusId
  const snapshot = await corpusSnapshotStore.latest(userId, corpusId)
  if (!snapshot) throw data("Corpus not found", { status: 404 })

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
    filters: {
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

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: `${loaderData?.corpus.corpusId ?? "Corpus"} | Lineage` },
]

export default function CorpusDetailRoute({
  loaderData,
}: Route.ComponentProps) {
  return <CorpusDetailPage {...loaderData} />
}
