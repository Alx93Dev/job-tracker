-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED');

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "positionTitle" TEXT NOT NULL,
    "jobUrl" TEXT,
    "location" TEXT,
    "salaryRange" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'WISHLIST',
    "appliedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

