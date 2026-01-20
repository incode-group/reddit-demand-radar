-- Migration: Initial Schema
-- This SQL file should be run manually against your Supabase PostgreSQL database
-- DO NOT run migrations directly - use this file for manual database setup

-- Create Subreddits table
CREATE TABLE IF NOT EXISTS "subreddits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subreddits_pkey" PRIMARY KEY ("id")
);

-- Create unique index on subreddit name
CREATE UNIQUE INDEX IF NOT EXISTS "subreddits_name_key" ON "subreddits"("name");

-- Create Keywords table
CREATE TABLE IF NOT EXISTS "keywords" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- Create unique index on keyword value
CREATE UNIQUE INDEX IF NOT EXISTS "keywords_value_key" ON "keywords"("value");

-- Create Matches table
CREATE TABLE IF NOT EXISTS "matches" (
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

-- Create unique index on postId
CREATE UNIQUE INDEX IF NOT EXISTS "matches_postId_key" ON "matches"("postId");

-- Create foreign key constraints
ALTER TABLE "matches" ADD CONSTRAINT "matches_subredditId_fkey" FOREIGN KEY ("subredditId") REFERENCES "subreddits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keywords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "matches_subredditId_idx" ON "matches"("subredditId");
CREATE INDEX IF NOT EXISTS "matches_keywordId_idx" ON "matches"("keywordId");
CREATE INDEX IF NOT EXISTS "matches_relevance_idx" ON "matches"("relevance");
CREATE INDEX IF NOT EXISTS "matches_createdAt_idx" ON "matches"("createdAt");
