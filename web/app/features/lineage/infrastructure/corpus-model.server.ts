import type {
  ActiveCorpusPreferenceStore,
  CorpusSnapshot,
  CorpusSnapshotStore,
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

export const corpusSnapshotStore: CorpusSnapshotStore = {
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
