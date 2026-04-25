-- CreateTable
CREATE TABLE "CrawlResult" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "metadata" JSONB NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrawlResult_createdAt_idx" ON "CrawlResult"("createdAt");

-- CreateIndex
CREATE INDEX "CrawlResult_url_idx" ON "CrawlResult"("url");
