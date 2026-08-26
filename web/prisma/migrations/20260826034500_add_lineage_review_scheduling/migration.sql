-- AlterTable
ALTER TABLE "LineageReview" ADD COLUMN "scheduler" TEXT NOT NULL DEFAULT 'lineage-prototype';
ALTER TABLE "LineageReview" ADD COLUMN "schedulerVersion" TEXT NOT NULL DEFAULT '1';
ALTER TABLE "LineageReview" ADD COLUMN "previousIntervalMinutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LineageReview" ADD COLUMN "nextIntervalMinutes" INTEGER NOT NULL DEFAULT 1;
