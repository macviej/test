-- AlterTable
ALTER TABLE "Participant" ADD COLUMN "lunchType" TEXT;
ALTER TABLE "Participant" ADD COLUMN "hasAllergy" BOOLEAN;
ALTER TABLE "Participant" ADD COLUMN "allergyNote" TEXT NOT NULL DEFAULT '';
