import { parseCorpusDocument } from "../domain/corpus"
import type {
  CorpusSnapshotStore,
  ReviewContractValidator,
} from "../domain/corpus-ports"
import {
  listCorpusAssets,
  replaceCorpusAssets,
} from "../infrastructure/lineage-asset-store.server"
import { importCorpus } from "./import-corpus.server"
import {
  createLineageManifest,
  decodeLineageArchive,
  encodeLineageArchive,
  validateLineageArchive,
} from "./lineage-archive.server"

const encoder = new TextEncoder()

export async function exportLineageArchive(input: {
  corpusId: string
  ownerId: string
  store: CorpusSnapshotStore
}) {
  const snapshot = await input.store.latest(input.ownerId, input.corpusId)
  if (!snapshot) return null
  const corpus = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const storedAssets = await listCorpusAssets(input)
  const declared = new Map(corpus.assets.map((asset) => [asset.id, asset]))
  const assets = storedAssets.filter((asset) => declared.has(asset.assetId))
  for (const asset of assets) {
    const declaration = declared.get(asset.assetId)
    if (
      !declaration ||
      declaration.path !== asset.path ||
      declaration.sha256 !== asset.sha256 ||
      declaration.byteSize !== asset.byteSize ||
      declaration.mediaType !== asset.mediaType
    ) {
      throw new Error(
        `Stored asset does not match corpus declaration: ${asset.assetId}`,
      )
    }
  }
  if (assets.length !== corpus.assets.length)
    throw new Error("Corpus asset dependency closure is incomplete")

  const corpusBytes = encoder.encode(snapshot.canonicalJson)
  const timestamp = new Date().toISOString()
  const manifest = createLineageManifest({
    corpusBytes,
    corpusId: input.corpusId,
    entries: assets.map((asset) => ({
      bytes: asset.bytes,
      mediaType: asset.mediaType,
      path: asset.path,
    })),
    timestamp,
  })
  const files = new Map<string, Uint8Array>([
    ["manifest.json", encoder.encode(JSON.stringify(manifest, null, 2))],
    ["corpus.json", corpusBytes],
    ...assets.map((asset) => [asset.path, asset.bytes] as const),
  ])
  return encodeLineageArchive(files)
}

export async function importLineageArchive(input: {
  bytes: Uint8Array
  ownerId: string
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}) {
  const files = decodeLineageArchive(input.bytes)
  const validation = validateLineageArchive({
    files,
    validator: input.validator,
  })
  if (!validation.valid) return validation
  const { corpus } = validation.value
  const imported = await importCorpus({
    input: corpus,
    ownerId: input.ownerId,
    store: input.store,
    validator: input.validator,
  })
  await replaceCorpusAssets({
    assets: corpus.assets.map((asset) => ({
      accessibleDescription: asset.accessibleDescription,
      assetId: asset.id,
      byteSize: asset.byteSize,
      bytes: files.get(asset.path)!,
      mediaType: asset.mediaType,
      path: asset.path,
      sha256: asset.sha256,
    })),
    corpusId: corpus.corpusId,
    ownerId: input.ownerId,
  })
  return { diagnostics: [], imported, valid: true } as const
}
