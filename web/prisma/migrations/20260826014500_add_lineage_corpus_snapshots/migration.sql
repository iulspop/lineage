-- CreateTable
CREATE TABLE "LineageCorpusSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "corpusId" TEXT NOT NULL,
    "formatVersion" INTEGER NOT NULL,
    "canonicalJson" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "LineageCorpusSnapshot_corpusId_digest_key" ON "LineageCorpusSnapshot"("corpusId", "digest");

-- CreateIndex
CREATE INDEX "LineageCorpusSnapshot_corpusId_createdAt_idx" ON "LineageCorpusSnapshot"("corpusId", "createdAt");
