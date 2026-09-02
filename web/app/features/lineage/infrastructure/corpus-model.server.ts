import type {
  ActiveCorpusPreferenceStore,
  CorpusSnapshot,
  OptimisticCorpusSnapshotStore,
} from "../domain/corpus-ports"
import { prisma } from "~/utils/db.server"

export async function listCorpusSnapshotRevisions(
  ownerId: string,
  corpusId: string,
) {
  return prisma.lineageCorpusSnapshot.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      canonicalJson: true,
      createdAt: true,
      digest: true,
      formatVersion: true,
    },
    where: { corpusId, ownerId },
  })
}

export const activeCorpusPreferenceStore: ActiveCorpusPreferenceStore = {
  async getActiveCorpusId(ownerId) {
    const user = await prisma.user.findUnique({
      select: { activeLineageCorpusId: true },
      where: { id: ownerId },
    })
    return user?.activeLineageCorpusId ?? null
  },

  async listCorpusIdsByRecentActivity(ownerId) {
    const snapshots = await prisma.lineageCorpusSnapshot.findMany({
      distinct: ["corpusId"],
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { corpusId: true },
      where: { ownerId },
    })
    return snapshots.map((snapshot) => snapshot.corpusId)
  },

  async setActiveCorpusId(ownerId, corpusId) {
    await prisma.user.update({
      data: { activeLineageCorpusId: corpusId },
      where: { id: ownerId },
    })
  },
}

export const corpusSnapshotStore: OptimisticCorpusSnapshotStore = {
  async append(ownerId, snapshot) {
    await prisma.lineageCorpusSnapshot.upsert({
      create: { ...snapshot, ownerId },
      update: {},
      where: {
        ownerId_corpusId_digest: {
          corpusId: snapshot.corpusId,
          digest: snapshot.digest,
          ownerId,
        },
      },
    })
  },

  async compareAndAppend(ownerId, expectedBase, snapshot) {
    return prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        select: { activeLineageCorpusId: true },
        where: { id: ownerId },
      })
      if (user?.activeLineageCorpusId !== expectedBase.corpusId)
        return {
          reason: "active-corpus-changed" as const,
          status: "conflict" as const,
        }

      const latest = await transaction.lineageCorpusSnapshot.findFirst({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { digest: true },
        where: { corpusId: expectedBase.corpusId, ownerId },
      })
      if (latest?.digest !== expectedBase.digest)
        return {
          reason: "snapshot-changed" as const,
          status: "conflict" as const,
        }

      const existing = await transaction.lineageCorpusSnapshot.findUnique({
        select: { id: true },
        where: {
          ownerId_corpusId_digest: {
            corpusId: snapshot.corpusId,
            digest: snapshot.digest,
            ownerId,
          },
        },
      })
      if (existing) return { status: "deduplicated" as const }
      await transaction.lineageCorpusSnapshot.create({
        data: { ...snapshot, ownerId },
      })
      return { status: "appended" as const }
    })
  },

  async find(ownerId, corpusId, digest): Promise<CorpusSnapshot | null> {
    return prisma.lineageCorpusSnapshot.findUnique({
      select: {
        canonicalJson: true,
        corpusId: true,
        digest: true,
        formatVersion: true,
      },
      where: {
        ownerId_corpusId_digest: { corpusId, digest, ownerId },
      },
    })
  },

  async latest(ownerId, corpusId): Promise<CorpusSnapshot | null> {
    return prisma.lineageCorpusSnapshot.findFirst({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        canonicalJson: true,
        corpusId: true,
        digest: true,
        formatVersion: true,
      },
      where: { corpusId, ownerId },
    })
  },

  async listLatest(ownerId): Promise<CorpusSnapshot[]> {
    const snapshots = await prisma.lineageCorpusSnapshot.findMany({
      orderBy: [{ corpusId: "asc" }, { createdAt: "desc" }, { id: "desc" }],
      select: {
        canonicalJson: true,
        corpusId: true,
        digest: true,
        formatVersion: true,
      },
      where: { ownerId },
    })
    return snapshots.filter(
      (snapshot, index) =>
        index === 0 || snapshots[index - 1]?.corpusId !== snapshot.corpusId,
    )
  },
}
