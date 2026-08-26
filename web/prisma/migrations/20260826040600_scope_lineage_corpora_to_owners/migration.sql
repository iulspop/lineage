-- Existing snapshots predate authenticated ownership. They remain as unowned legacy
-- records and are intentionally inaccessible through the owner-scoped application port.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_LineageCorpusSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT,
    "corpusId" TEXT NOT NULL,
    "formatVersion" INTEGER NOT NULL,
    "canonicalJson" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LineageCorpusSnapshot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_LineageCorpusSnapshot" ("canonicalJson", "corpusId", "createdAt", "digest", "formatVersion", "id")
SELECT "canonicalJson", "corpusId", "createdAt", "digest", "formatVersion", "id"
FROM "LineageCorpusSnapshot";

DROP TABLE "LineageCorpusSnapshot";
ALTER TABLE "new_LineageCorpusSnapshot" RENAME TO "LineageCorpusSnapshot";

CREATE UNIQUE INDEX "LineageCorpusSnapshot_ownerId_corpusId_digest_key" ON "LineageCorpusSnapshot"("ownerId", "corpusId", "digest");
CREATE INDEX "LineageCorpusSnapshot_ownerId_corpusId_createdAt_idx" ON "LineageCorpusSnapshot"("ownerId", "corpusId", "createdAt");

PRAGMA foreign_keys=ON;
