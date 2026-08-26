import { data } from "react-router"

import type { Route } from "./+types/library.$corpusId.archive"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { exportLineageArchive } from "~/features/lineage/application/archive-portability.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"

export async function loader({ params, request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const snapshot = await corpusSnapshotStore.latest(ownerId, params.corpusId)
  if (!snapshot) throw data("Corpus not found", { status: 404 })
  const bytes = await exportLineageArchive({
    corpusId: params.corpusId,
    ownerId,
    store: corpusSnapshotStore,
  })
  if (!bytes) throw data("Corpus not found", { status: 404 })
  return new Response(bytes as BodyInit, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(params.corpusId)}.lineage"`,
      "Content-Type": "application/zip",
    },
  })
}
