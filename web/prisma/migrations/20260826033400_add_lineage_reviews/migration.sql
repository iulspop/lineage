-- CreateTable
CREATE TABLE "LineageReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "corpusId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "promptRevision" INTEGER NOT NULL,
    "attemptedResponse" TEXT,
    "assessment" TEXT NOT NULL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LineageReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LineageReview_userId_reviewedAt_idx" ON "LineageReview"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "LineageReview_corpusId_promptId_promptRevision_idx" ON "LineageReview"("corpusId", "promptId", "promptRevision");
