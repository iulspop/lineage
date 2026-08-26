import type {
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
