ALTER TABLE "LineageReview" ADD COLUMN "schedulerImplementation" TEXT;
ALTER TABLE "LineageReview" ADD COLUMN "schedulerProfile" TEXT;
ALTER TABLE "LineageReview" ADD COLUMN "parameterSet" TEXT;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsDueAt" DATETIME;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsStability" REAL;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsDifficulty" REAL;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsElapsedDays" REAL;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsScheduledDays" INTEGER;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsLearningSteps" INTEGER;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsReps" INTEGER;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsLapses" INTEGER;
ALTER TABLE "LineageReview" ADD COLUMN "fsrsState" INTEGER;

CREATE INDEX "LineageReview_userId_corpusId_fsrsDueAt_idx"
ON "LineageReview"("userId", "corpusId", "fsrsDueAt");
