import { data } from "react-router"

import type { Route } from "./+types/library.$corpusId.assets.$assetId"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { listCorpusAssets } from "~/features/lineage/infrastructure/lineage-asset-store.server"

export async function loader({ params, request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const asset = (
    await listCorpusAssets({ corpusId: params.corpusId, ownerId })
  ).find(({ assetId }) => assetId === params.assetId)
  if (!asset) throw data("Asset not found", { status: 404 })
  const bytes = new Uint8Array(asset.bytes.byteLength)
  bytes.set(asset.bytes)
  return new Response(bytes.buffer, {
    headers: {
      "Cache-Control": "private, max-age=31536000, immutable",
      "Content-Length": String(asset.byteSize),
      "Content-Type": asset.mediaType,
      ETag: `"${asset.sha256}"`,
    },
  })
}
