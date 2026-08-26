-- CreateTable
CREATE TABLE "LineageAssetBlob" (
    "sha256" TEXT NOT NULL PRIMARY KEY,
    "bytes" BLOB NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LineageCorpusAsset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "corpusId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "archivePath" TEXT NOT NULL,
    "accessibilityDescription" TEXT,
    "blobSha256" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LineageCorpusAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LineageCorpusAsset_blobSha256_fkey" FOREIGN KEY ("blobSha256") REFERENCES "LineageAssetBlob" ("sha256") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LineageReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "corpusId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "promptRevision" INTEGER NOT NULL,
    "attemptedResponse" TEXT,
    "assessment" TEXT NOT NULL,
    "scheduler" TEXT NOT NULL,
    "schedulerVersion" TEXT NOT NULL,
    "schedulerImplementation" TEXT,
    "schedulerProfile" TEXT,
    "parameterSet" TEXT,
    "previousIntervalMinutes" INTEGER NOT NULL,
    "nextIntervalMinutes" INTEGER NOT NULL,
    "fsrsDueAt" DATETIME,
    "fsrsStability" REAL,
    "fsrsDifficulty" REAL,
    "fsrsElapsedDays" REAL,
    "fsrsScheduledDays" INTEGER,
    "fsrsLearningSteps" INTEGER,
    "fsrsReps" INTEGER,
    "fsrsLapses" INTEGER,
    "fsrsState" INTEGER,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LineageReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LineageReview" ("assessment", "attemptedResponse", "corpusId", "fsrsDifficulty", "fsrsDueAt", "fsrsElapsedDays", "fsrsLapses", "fsrsLearningSteps", "fsrsReps", "fsrsScheduledDays", "fsrsStability", "fsrsState", "id", "nextIntervalMinutes", "parameterSet", "previousIntervalMinutes", "promptId", "promptRevision", "reviewedAt", "scheduler", "schedulerImplementation", "schedulerProfile", "schedulerVersion", "userId") SELECT "assessment", "attemptedResponse", "corpusId", "fsrsDifficulty", "fsrsDueAt", "fsrsElapsedDays", "fsrsLapses", "fsrsLearningSteps", "fsrsReps", "fsrsScheduledDays", "fsrsStability", "fsrsState", "id", "nextIntervalMinutes", "parameterSet", "previousIntervalMinutes", "promptId", "promptRevision", "reviewedAt", "scheduler", "schedulerImplementation", "schedulerProfile", "schedulerVersion", "userId" FROM "LineageReview";
DROP TABLE "LineageReview";
ALTER TABLE "new_LineageReview" RENAME TO "LineageReview";
CREATE INDEX "LineageReview_userId_reviewedAt_idx" ON "LineageReview"("userId", "reviewedAt");
CREATE INDEX "LineageReview_corpusId_promptId_promptRevision_idx" ON "LineageReview"("corpusId", "promptId", "promptRevision");
CREATE INDEX "LineageReview_userId_corpusId_fsrsDueAt_idx" ON "LineageReview"("userId", "corpusId", "fsrsDueAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LineageCorpusAsset_ownerId_corpusId_idx" ON "LineageCorpusAsset"("ownerId", "corpusId");

-- CreateIndex
CREATE INDEX "LineageCorpusAsset_blobSha256_idx" ON "LineageCorpusAsset"("blobSha256");

-- CreateIndex
CREATE UNIQUE INDEX "LineageCorpusAsset_ownerId_corpusId_assetId_key" ON "LineageCorpusAsset"("ownerId", "corpusId", "assetId");
