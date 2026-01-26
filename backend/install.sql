-- CreateTable
CREATE TABLE "subreddits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subreddits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "subredditId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "relevance" DOUBLE PRECISION NOT NULL,
    "sentiment" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gemini_requests" (
    "id" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gemini_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reddit_requests" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT,
    "subreddits" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "subredditsMatchCount" INTEGER NOT NULL,
    "commentsMatchCount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reddit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subreddits_name_key" ON "subreddits"("name");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_value_key" ON "keywords"("value");

-- CreateIndex
CREATE UNIQUE INDEX "matches_postId_key" ON "matches"("postId");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_subredditId_fkey" FOREIGN KEY ("subredditId") REFERENCES "subreddits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keywords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

