-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_USER_REGISTRATION', 'CONTACT_FORM_SUBMISSION');

-- CreateTable
CREATE TABLE "admin_notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_notifications_isRead_createdAt_idx" ON "admin_notifications"("isRead", "createdAt");

-- CreateIndex
CREATE INDEX "admin_notifications_type_createdAt_idx" ON "admin_notifications"("type", "createdAt");

-- CreateIndex
CREATE INDEX "articles_title_idx" ON "articles"("title");

-- CreateIndex
CREATE INDEX "articles_createdAt_idx" ON "articles"("createdAt");

-- CreateIndex
CREATE INDEX "articles_viewCount_idx" ON "articles"("viewCount");

-- CreateIndex
CREATE INDEX "articles_authorId_idx" ON "articles"("authorId");

-- CreateIndex
CREATE INDEX "courses_title_idx" ON "courses"("title");

-- CreateIndex
CREATE INDEX "courses_createdAt_idx" ON "courses"("createdAt");

-- CreateIndex
CREATE INDEX "courses_lessonsCount_idx" ON "courses"("lessonsCount");

-- CreateIndex
CREATE INDEX "courses_studentsCount_idx" ON "courses"("studentsCount");

-- CreateIndex
CREATE INDEX "job_listings_company_idx" ON "job_listings"("company");

-- CreateIndex
CREATE INDEX "job_listings_location_idx" ON "job_listings"("location");

-- CreateIndex
CREATE INDEX "job_listings_title_idx" ON "job_listings"("title");

-- CreateIndex
CREATE INDEX "job_listings_createdAt_idx" ON "job_listings"("createdAt");

-- CreateIndex
CREATE INDEX "job_listings_viewCount_idx" ON "job_listings"("viewCount");

-- CreateIndex
CREATE INDEX "lessons_title_idx" ON "lessons"("title");

-- CreateIndex
CREATE INDEX "lessons_isFree_idx" ON "lessons"("isFree");

-- CreateIndex
CREATE INDEX "mock_tests_title_idx" ON "mock_tests"("title");

-- CreateIndex
CREATE INDEX "mock_tests_createdAt_idx" ON "mock_tests"("createdAt");

-- CreateIndex
CREATE INDEX "saved_items_savedAt_idx" ON "saved_items"("savedAt");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
