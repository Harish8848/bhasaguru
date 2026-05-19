-- CreateTable
CREATE TABLE "culture_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "featuredImage" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "authorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "culture_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "culture_posts_slug_key" ON "culture_posts"("slug");

-- CreateIndex
CREATE INDEX "culture_posts_language_idx" ON "culture_posts"("language");

-- CreateIndex
CREATE INDEX "culture_posts_status_publishedAt_idx" ON "culture_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "culture_posts_title_idx" ON "culture_posts"("title");

-- CreateIndex
CREATE INDEX "culture_posts_createdAt_idx" ON "culture_posts"("createdAt");

-- CreateIndex
CREATE INDEX "culture_posts_viewCount_idx" ON "culture_posts"("viewCount");
