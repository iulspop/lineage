import { data } from "react-router"

import type { Route } from "./+types/library.$corpusId.export"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { exportCorpus } from "~/features/lineage/application/import-corpus.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"

export async function loader({ params, request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const document = await exportCorpus({
    corpusId: params.corpusId,
    ownerId,
    store: corpusSnapshotStore,
  })
  if (!document) throw data("Corpus not found", { status: 404 })

  return new Response(`${JSON.stringify(document, null, 2)}\n`, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(params.corpusId)}.lineage.json"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}
