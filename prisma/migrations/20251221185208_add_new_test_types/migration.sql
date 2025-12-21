-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'SPEAKING_PART1';
ALTER TYPE "QuestionType" ADD VALUE 'SPEAKING_PART2';
ALTER TYPE "QuestionType" ADD VALUE 'SPEAKING_PART3';
ALTER TYPE "QuestionType" ADD VALUE 'WRITING';
ALTER TYPE "QuestionType" ADD VALUE 'READING_COMPREHENSION';
ALTER TYPE "QuestionType" ADD VALUE 'LISTENING_COMPREHENSION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TestType" ADD VALUE 'LISTENING';
ALTER TYPE "TestType" ADD VALUE 'READING';
ALTER TYPE "TestType" ADD VALUE 'SPEAKING';
ALTER TYPE "TestType" ADD VALUE 'WRITING';

-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "jsonAnswer" JSONB;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "cueCardContent" TEXT,
ADD COLUMN     "followUpQuestions" JSONB,
ADD COLUMN     "preparationTime" INTEGER,
ADD COLUMN     "speakingTime" INTEGER,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "speaking_scores" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "fluencyCoherence" DOUBLE PRECISION NOT NULL,
    "lexicalResource" DOUBLE PRECISION NOT NULL,
    "grammaticalRange" DOUBLE PRECISION NOT NULL,
    "pronunciation" DOUBLE PRECISION NOT NULL,
    "overallBand" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "speaking_scores_attemptId_key" ON "speaking_scores"("attemptId");

-- CreateIndex
CREATE INDEX "speaking_scores_attemptId_idx" ON "speaking_scores"("attemptId");

-- AddForeignKey
ALTER TABLE "speaking_scores" ADD CONSTRAINT "speaking_scores_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
