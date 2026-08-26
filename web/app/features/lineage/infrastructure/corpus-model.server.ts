import type {
  CorpusSnapshot,
  CorpusSnapshotStore,
} from "../domain/corpus-ports"
import { prisma } from "~/utils/db.server"

export const corpusSnapshotStore: CorpusSnapshotStore = {
  async append(snapshot) {
    await prisma.lineageCorpusSnapshot.upsert({
      create: snapshot,
      update: {},
      where: {
        corpusId_digest: {
          corpusId: snapshot.corpusId,
          digest: snapshot.digest,
        },
      },
    })
  },

  async latest(corpusId): Promise<CorpusSnapshot | null> {
    return prisma.lineageCorpusSnapshot.findFirst({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        canonicalJson: true,
        corpusId: true,
        digest: true,
        formatVersion: true,
      },
      where: { corpusId },
    })
  },
}
