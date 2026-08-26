import { createHash } from "node:crypto"

import { prisma } from "~/utils/db.server"

export type StoredLineageAsset = {
  accessibleDescription?: string
  assetId: string
  byteSize: number
  bytes: Uint8Array
  mediaType: string
  path: string
  sha256: string
}

export async function replaceCorpusAssets(input: {
  assets: StoredLineageAsset[]
  corpusId: string
  ownerId: string
}) {
  await prisma.$transaction(async (tx) => {
    for (const asset of input.assets) {
      const sha256 = createHash("sha256").update(asset.bytes).digest("hex")
      if (
        sha256 !== asset.sha256 ||
        asset.bytes.byteLength !== asset.byteSize
      ) {
        throw new Error(`Asset integrity failed for ${asset.assetId}`)
      }
      await tx.lineageAssetBlob.upsert({
        create: {
          byteSize: asset.byteSize,
          bytes: new Uint8Array(asset.bytes),
          mediaType: asset.mediaType,
          sha256,
        },
        update: {},
        where: { sha256 },
      })
      const existing = await tx.lineageCorpusAsset.findUnique({
        where: {
          ownerId_corpusId_assetId: {
            assetId: asset.assetId,
            corpusId: input.corpusId,
            ownerId: input.ownerId,
          },
        },
      })
      if (existing && existing.blobSha256 !== sha256)
        throw new Error(`Asset identity is immutable: ${asset.assetId}`)
      await tx.lineageCorpusAsset.upsert({
        create: {
          accessibilityDescription: asset.accessibleDescription,
          archivePath: asset.path,
          assetId: asset.assetId,
          blobSha256: sha256,
          corpusId: input.corpusId,
          ownerId: input.ownerId,
        },
        update: {
          accessibilityDescription: asset.accessibleDescription,
          archivePath: asset.path,
        },
        where: {
          ownerId_corpusId_assetId: {
            assetId: asset.assetId,
            corpusId: input.corpusId,
            ownerId: input.ownerId,
          },
        },
      })
    }
  })
}

export async function listCorpusAssets(input: {
  corpusId: string
  ownerId: string
}): Promise<StoredLineageAsset[]> {
  const assets = await prisma.lineageCorpusAsset.findMany({
    include: { blob: true },
    orderBy: { assetId: "asc" },
    where: { corpusId: input.corpusId, ownerId: input.ownerId },
  })
  return assets.map(
    ({ accessibilityDescription, archivePath, assetId, blob }) => ({
      accessibleDescription: accessibilityDescription ?? undefined,
      assetId,
      byteSize: blob.byteSize,
      bytes: new Uint8Array(blob.bytes),
      mediaType: blob.mediaType,
      path: archivePath,
      sha256: blob.sha256,
    }),
  )
}
