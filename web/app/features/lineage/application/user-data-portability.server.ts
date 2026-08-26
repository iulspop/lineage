import { createHash } from "node:crypto"
import { z } from "zod"

import { parseCorpusDocument, serializeCorpusDocument } from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"
import {
  decodeLineageArchive,
  encodeLineageArchive,
} from "./lineage-archive.server"
import { prisma } from "~/utils/db.server"

const digestSchema = z.string().regex(/^[a-f0-9]{64}$/)
const portableSnapshotSchema = z.object({
  canonicalJson: z.string(),
  corpusId: z.string().min(1),
  createdAt: z.iso.datetime(),
  digest: digestSchema,
  formatVersion: z.int().positive(),
})
const portableReviewSchema = z.object({
  assessment: z.string(),
  attemptedResponse: z.string().nullable(),
  corpusId: z.string().min(1),
  fsrsDifficulty: z.number().nullable(),
  fsrsDueAt: z.iso.datetime().nullable(),
  fsrsElapsedDays: z.number().nullable(),
  fsrsLapses: z.int().nullable(),
  fsrsLearningSteps: z.int().nullable(),
  fsrsReps: z.int().nullable(),
  fsrsScheduledDays: z.int().nullable(),
  fsrsStability: z.number().nullable(),
  fsrsState: z.int().nullable(),
  nextIntervalMinutes: z.int(),
  parameterSet: z.string().nullable(),
  previousIntervalMinutes: z.int(),
  promptId: z.string().min(1),
  promptRevision: z.int().positive(),
  reviewedAt: z.iso.datetime(),
  scheduler: z.string(),
  schedulerImplementation: z.string().nullable(),
  schedulerProfile: z.string().nullable(),
  schedulerVersion: z.string(),
})
const portableAssetSchema = z.object({
  accessibilityDescription: z.string().nullable(),
  archivePath: z.string().min(1),
  assetId: z.string().min(1),
  byteSize: z.int().nonnegative(),
  corpusId: z.string().min(1),
  mediaType: z.string().min(1),
  sha256: digestSchema,
})
const portableDataSchema = z.object({
  assets: z.array(portableAssetSchema),
  exportedAt: z.iso.datetime(),
  format: z.literal("lineage.user-data"),
  formatVersion: z.literal(1),
  reviews: z.array(portableReviewSchema),
  snapshots: z.array(portableSnapshotSchema),
})

type PortableData = z.infer<typeof portableDataSchema>

function decodeExport(bytes: Uint8Array) {
  const files = decodeLineageArchive(bytes)
  const dataBytes = files.get("user-data.json")
  if (!dataBytes) throw new Error("Export has no user-data.json")
  return {
    data: portableDataSchema.parse(
      JSON.parse(new TextDecoder().decode(dataBytes)),
    ),
    files,
  }
}

export async function exportUserData(ownerId: string) {
  const [snapshots, reviews, assets] = await Promise.all([
    prisma.lineageCorpusSnapshot.findMany({
      orderBy: [{ corpusId: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      where: { ownerId },
    }),
    prisma.lineageReview.findMany({
      orderBy: [{ reviewedAt: "asc" }, { id: "asc" }],
      where: { userId: ownerId },
    }),
    prisma.lineageCorpusAsset.findMany({
      include: { blob: true },
      orderBy: [{ corpusId: "asc" }, { assetId: "asc" }],
      where: { ownerId },
    }),
  ])
  const data = portableDataSchema.parse({
    assets: assets.map(
      ({ accessibilityDescription, archivePath, assetId, blob, corpusId }) => ({
        accessibilityDescription,
        archivePath,
        assetId,
        byteSize: blob.byteSize,
        corpusId,
        mediaType: blob.mediaType,
        sha256: blob.sha256,
      }),
    ),
    exportedAt: new Date().toISOString(),
    format: "lineage.user-data",
    formatVersion: 1,
    reviews: reviews.map(({ id: _, userId: __, ...review }) => ({
      ...review,
      fsrsDueAt: review.fsrsDueAt?.toISOString() ?? null,
      reviewedAt: review.reviewedAt.toISOString(),
    })),
    snapshots: snapshots.map(({ id: _, ownerId: __, ...snapshot }) => ({
      ...snapshot,
      createdAt: snapshot.createdAt.toISOString(),
    })),
  })
  const files = new Map<string, Uint8Array>([
    ["user-data.json", new TextEncoder().encode(JSON.stringify(data, null, 2))],
    ...assets.map(
      ({ archivePath, blob, corpusId }) =>
        [
          `assets/${corpusId}/${archivePath}`,
          new Uint8Array(blob.bytes),
        ] as const,
    ),
  ])
  return encodeLineageArchive(files)
}

export function inspectUserDataExport(bytes: Uint8Array) {
  const { data } = decodeExport(bytes)
  return {
    assetCount: data.assets.length,
    corpusCount: new Set(data.snapshots.map(({ corpusId }) => corpusId)).size,
    reviewCount: data.reviews.length,
    snapshotCount: data.snapshots.length,
  }
}

export async function restoreUserData(input: {
  bytes: Uint8Array
  conflict: "reject" | "replace"
  ownerId: string
  validator: ReviewContractValidator
}) {
  const { data, files } = decodeExport(input.bytes)
  validateRecoveryData(data, files, input.validator)

  await prisma.$transaction(async (tx) => {
    const existing = await Promise.all([
      tx.lineageCorpusSnapshot.count({ where: { ownerId: input.ownerId } }),
      tx.lineageReview.count({ where: { userId: input.ownerId } }),
      tx.lineageCorpusAsset.count({ where: { ownerId: input.ownerId } }),
    ])
    if (input.conflict === "reject" && existing.some((count) => count > 0))
      throw new Error("Restore target already contains Lineage data")
    if (input.conflict === "replace") {
      await tx.lineageCorpusAsset.deleteMany({
        where: { ownerId: input.ownerId },
      })
      await tx.lineageReview.deleteMany({ where: { userId: input.ownerId } })
      await tx.lineageCorpusSnapshot.deleteMany({
        where: { ownerId: input.ownerId },
      })
    }

    for (const snapshot of data.snapshots) {
      await tx.lineageCorpusSnapshot.create({
        data: {
          ...snapshot,
          createdAt: new Date(snapshot.createdAt),
          ownerId: input.ownerId,
        },
      })
    }
    for (const review of data.reviews) {
      await tx.lineageReview.create({
        data: {
          ...review,
          fsrsDueAt: review.fsrsDueAt ? new Date(review.fsrsDueAt) : null,
          reviewedAt: new Date(review.reviewedAt),
          userId: input.ownerId,
        },
      })
    }
    for (const asset of data.assets) {
      const bytes = files.get(`assets/${asset.corpusId}/${asset.archivePath}`)!
      await tx.lineageAssetBlob.upsert({
        create: {
          byteSize: asset.byteSize,
          bytes: new Uint8Array(bytes),
          mediaType: asset.mediaType,
          sha256: asset.sha256,
        },
        update: {},
        where: { sha256: asset.sha256 },
      })
      await tx.lineageCorpusAsset.create({
        data: {
          accessibilityDescription: asset.accessibilityDescription,
          archivePath: asset.archivePath,
          assetId: asset.assetId,
          blobSha256: asset.sha256,
          corpusId: asset.corpusId,
          ownerId: input.ownerId,
        },
      })
    }
  })
  return inspectUserDataExport(input.bytes)
}

function validateRecoveryData(
  data: PortableData,
  files: ReadonlyMap<string, Uint8Array>,
  validator: ReviewContractValidator,
) {
  const revisions = new Set<string>()
  const declaredAssets = new Map<
    string,
    { byteSize: number; mediaType: string; path: string; sha256: string }
  >()
  for (const snapshot of data.snapshots) {
    const parsed = JSON.parse(snapshot.canonicalJson)
    const validation = validator.validateCorpus?.(parsed)
    if (validation && !validation.valid)
      throw new Error(`Invalid corpus snapshot: ${snapshot.corpusId}`)
    const document = validation?.valid
      ? validation.document
      : parseCorpusDocument(parsed)
    const canonicalJson = serializeCorpusDocument(document)
    const digest = createHash("sha256").update(canonicalJson).digest("hex")
    if (
      document.corpusId !== snapshot.corpusId ||
      document.formatVersion !== snapshot.formatVersion ||
      canonicalJson !== snapshot.canonicalJson ||
      digest !== snapshot.digest
    )
      throw new Error(`Corpus snapshot integrity failed: ${snapshot.corpusId}`)
    for (const prompt of document.prompts)
      revisions.add(`${snapshot.corpusId}\0${prompt.id}\0${prompt.revision}`)
    for (const asset of document.assets)
      declaredAssets.set(`${snapshot.corpusId}\0${asset.id}`, asset)
  }
  for (const review of data.reviews) {
    if (
      !revisions.has(
        `${review.corpusId}\0${review.promptId}\0${review.promptRevision}`,
      )
    )
      throw new Error(
        `Review references an unavailable Prompt revision: ${review.promptId}`,
      )
  }
  for (const asset of data.assets) {
    const declaration = declaredAssets.get(
      `${asset.corpusId}\0${asset.assetId}`,
    )
    const bytes = files.get(`assets/${asset.corpusId}/${asset.archivePath}`)
    if (
      !declaration ||
      declaration.path !== asset.archivePath ||
      declaration.byteSize !== asset.byteSize ||
      declaration.mediaType !== asset.mediaType ||
      declaration.sha256 !== asset.sha256 ||
      !bytes ||
      bytes.byteLength !== asset.byteSize ||
      createHash("sha256").update(bytes).digest("hex") !== asset.sha256
    )
      throw new Error(`Asset integrity failed: ${asset.assetId}`)
    declaredAssets.delete(`${asset.corpusId}\0${asset.assetId}`)
  }
  if (declaredAssets.size > 0)
    throw new Error("Recovery export has incomplete asset dependency closure")
}
