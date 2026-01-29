"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Target,
  Sparkles,
  Users,
} from "lucide-react";

interface AnalysisResult {
  mentioned: boolean;
  mentionedKeywords: string[];
  snippet: string;
  confidence: number;
  analysis: string;
  subreddit?: string;
  postLink?: string;
}

interface CommentsAnalysisResult {
  postId: string;
  mentioned: boolean;
  mentionedKeywords: string[];
  snippet: string;
  confidence: number;
  analysis: string;
  commentCount: number;
  analyzedCommentCount: number;
}

interface AnalysisResponse {
  subreddits: string[];
  keywords: string[];
  totalPosts: number;
  analysisResults: AnalysisResult[];
  commentsAnalysisResults: CommentsAnalysisResult[];
  highIntentCount: number;
  highIntentCommentsCount: number;
  processingTime: string;
  tokensSpent: number;
}

interface ResultsViewProps {
  results: AnalysisResponse;
}

export function ResultsView({ results }: ResultsViewProps) {
  if (!results || !results.analysisResults) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No results to display</p>
      </div>
    );
  }

  const {
    analysisResults,
    subreddits,
    keywords,
    totalPosts,
    highIntentCount,
    processingTime,
    tokensSpent,
  } = results;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts Analyzed</p>
                <p className="text-2xl font-bold text-[#6b21a8]">
                  {totalPosts}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#6b21a8] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tokens Spent</p>
                <p className="text-2xl font-bold text-[#6b21a8]">
                  {tokensSpent.toLocaleString()}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-[#6b21a8] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Intent Matches</p>
                <p className="text-2xl font-bold text-[#6b21a8]">
                  {highIntentCount}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-[#6b21a8] opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Details */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Details</CardTitle>
          <CardDescription>
            Subreddits: {subreddits.join(", ")} | Keywords:{" "}
            {keywords.join(", ")} | Processed: {processingTime}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Posts Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#6b21a8]">
            High Intent Post Matches
          </h2>
          <Badge variant="secondary" className="text-sm">
            {highIntentCount} matches found
          </Badge>
        </div>

        <AnimatePresence mode="popLayout">
          {analysisResults
            .filter((result) => result.mentioned)
            .map((result, index) => (
              <motion.div
                key={`post-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                layout
              >
                <Card className="hover:shadow-xl hover:shadow-purple-500/10 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          High Intent Post Match
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Confidence: {Math.round(result.confidence * 100)}%
                          </Badge>
                          {result.mentionedKeywords.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Keywords: {result.mentionedKeywords.join(", ")}
                            </Badge>
                          )}
                          {result.subreddit && (
                            <Badge
                              variant="default"
                              className="text-xs bg-purple-100 text-purple-800"
                            >
                              r/{result.subreddit}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                          Snippet:
                        </h3>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                          "{result.snippet}"
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                          Analysis:
                        </h3>
                        <p className="text-gray-700">{result.analysis}</p>
                      </div>
                      {result.postLink && (
                        <div className="flex justify-end">
                          <a
                            href={result.postLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#6b21a8] hover:text-[#7c3aed] font-medium transition-colors"
                          >
                            View Post
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Comments Results List */}
      {results.commentsAnalysisResults &&
        results.commentsAnalysisResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#6b21a8]">
                High Intent Comment Matches
              </h2>
              <Badge variant="secondary" className="text-sm">
                {results.highIntentCommentsCount} matches found
              </Badge>
            </div>

            <AnimatePresence mode="popLayout">
              {results.commentsAnalysisResults
                .filter((result) => result.mentioned)
                .map((result, index) => (
                  <motion.div
                    key={`comment-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    layout
                  >
                    <Card className="hover:shadow-xl hover:shadow-blue-500/10 transition-all border-blue-200">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-blue-600" />
                              High Intent Comment Match
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                Confidence:{" "}
                                {Math.round(result.confidence * 100)}%
                              </Badge>
                              {result.mentionedKeywords.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  Keywords:{" "}
                                  {result.mentionedKeywords.join(", ")}
                                </Badge>
                              )}
                              <Badge
                                variant="default"
                                className="text-xs bg-blue-100 text-blue-800"
                              >
                                Post ID: {result.postId}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">
                              Snippet:
                            </h3>
                            <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">
                              "{result.snippet}"
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">
                              Analysis:
                            </h3>
                            <p className="text-gray-700">{result.analysis}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
    </motion.div>
  );
}
