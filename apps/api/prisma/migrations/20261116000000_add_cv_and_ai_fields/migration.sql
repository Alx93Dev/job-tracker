-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cvText" TEXT,
ADD COLUMN     "cvUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "cvMatch" JSONB,
ADD COLUMN     "cvMatchedAt" TIMESTAMP(3),
ADD COLUMN     "jobDescription" TEXT;

