import { createHash } from "node:crypto"
import { afterEach, describe, expect, test } from "vitest"

import { parseCorpusDocument, serializeCorpusDocument } from "../domain/corpus"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import {
  exportUserData,
  inspectUserDataExport,
  restoreUserData,
} from "./user-data-portability.server"
import { prisma } from "~/utils/db.server"

const ownerId = "user-data-recovery-owner"
const assetBytes = new TextEncoder().encode("diagram bytes")
const assetDigest = createHash("sha256").update(assetBytes).digest("hex")
const canonicalJson = serializeCorpusDocument(
  parseCorpusDocument({
    assets: [
      {
        accessibleDescription: "A small study diagram.",
        byteSize: assetBytes.byteLength,
        id: "diagram",
        mediaType: "image/png",
        path: "assets/diagram.png",
        sha256: assetDigest,
      },
    ],
    corpusId: "recovery-corpus",
    format: "lineage.corpus",
    formatVersion: 1,
    prompts: [
      {
        assets: ["diagram"],
        challenge: ["Identify the concept in the diagram."],
        id: "recovery-memory",
        resolution: ["The recovered answer."],
        response: { capture: "none", mode: "self-check" },
        revision: 1,
        withheld: ["The recovered answer."],
      },
    ],
  }),
)
const snapshotDigest = createHash("sha256").update(canonicalJson).digest("hex")

async function clearLineageData() {
  await prisma.lineageCorpusAsset.deleteMany({ where: { ownerId } })
  await prisma.lineageAssetBlob.deleteMany({ where: { sha256: assetDigest } })
  await prisma.lineageReview.deleteMany({ where: { userId: ownerId } })
  await prisma.lineageCorpusSnapshot.deleteMany({ where: { ownerId } })
  await prisma.user.deleteMany({ where: { id: ownerId } })
}

afterEach(clearLineageData)

describe("complete Lineage user-data recovery", () => {
  test("reconstructs reviewable snapshots, immutable history, reviews, and assets", async () => {
    await clearLineageData()
    await prisma.user.create({
      data: { email: "recovery@example.com", id: ownerId },
    })
    await prisma.lineageCorpusSnapshot.create({
      data: {
        canonicalJson,
        corpusId: "recovery-corpus",
        digest: snapshotDigest,
        formatVersion: 1,
        ownerId,
      },
    })
    await prisma.lineageReview.create({
      data: {
        assessment: "good",
        corpusId: "recovery-corpus",
        nextIntervalMinutes: 1440,
        previousIntervalMinutes: 0,
        promptId: "recovery-memory",
        promptRevision: 1,
        scheduler: "fsrs",
        schedulerVersion: "6",
        userId: ownerId,
      },
    })
    await prisma.lineageAssetBlob.create({
      data: {
        byteSize: assetBytes.byteLength,
        bytes: new Uint8Array(assetBytes),
        mediaType: "image/png",
        sha256: assetDigest,
      },
    })
    await prisma.lineageCorpusAsset.create({
      data: {
        accessibilityDescription: "A small study diagram.",
        archivePath: "assets/diagram.png",
        assetId: "diagram",
        blobSha256: assetDigest,
        corpusId: "recovery-corpus",
        ownerId,
      },
    })

    const exported = await exportUserData(ownerId)
    expect(inspectUserDataExport(exported)).toEqual({
      assetCount: 1,
      corpusCount: 1,
      reviewCount: 1,
      snapshotCount: 1,
    })

    await prisma.lineageCorpusAsset.deleteMany({ where: { ownerId } })
    await prisma.lineageReview.deleteMany({ where: { userId: ownerId } })
    await prisma.lineageCorpusSnapshot.deleteMany({ where: { ownerId } })

    await restoreUserData({
      bytes: exported,
      conflict: "reject",
      ownerId,
      validator: lineageRuntime,
    })

    const [snapshots, reviews, assets] = await Promise.all([
      prisma.lineageCorpusSnapshot.findMany({ where: { ownerId } }),
      prisma.lineageReview.findMany({ where: { userId: ownerId } }),
      prisma.lineageCorpusAsset.findMany({
        include: { blob: true },
        where: { ownerId },
      }),
    ])
    expect(snapshots).toHaveLength(1)
    expect(lineageRuntime.validateCorpus).toBeDefined()
    expect(
      lineageRuntime.validateCorpus!(JSON.parse(snapshots[0]!.canonicalJson))
        .valid,
    ).toBe(true)
    expect(reviews[0]).toMatchObject({
      assessment: "good",
      promptId: "recovery-memory",
      promptRevision: 1,
    })
    expect(new Uint8Array(assets[0]!.blob.bytes)).toEqual(assetBytes)
  })

  test("rejects recovery when review history references a missing revision", async () => {
    await clearLineageData()
    await prisma.user.create({
      data: { email: "recovery@example.com", id: ownerId },
    })
    await prisma.lineageCorpusSnapshot.create({
      data: {
        canonicalJson,
        corpusId: "recovery-corpus",
        digest: snapshotDigest,
        formatVersion: 1,
        ownerId,
      },
    })
    await prisma.lineageReview.create({
      data: {
        assessment: "again",
        corpusId: "recovery-corpus",
        nextIntervalMinutes: 1,
        previousIntervalMinutes: 0,
        promptId: "missing-memory",
        promptRevision: 9,
        scheduler: "fsrs",
        schedulerVersion: "6",
        userId: ownerId,
      },
    })
    const exported = await exportUserData(ownerId)
    await prisma.lineageReview.deleteMany({ where: { userId: ownerId } })
    await prisma.lineageCorpusSnapshot.deleteMany({ where: { ownerId } })

    await expect(
      restoreUserData({
        bytes: exported,
        conflict: "reject",
        ownerId,
        validator: lineageRuntime,
      }),
    ).rejects.toThrow("Review references an unavailable Prompt revision")
  })
})
