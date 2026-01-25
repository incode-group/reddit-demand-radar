"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubredditSelector } from "@/components/dashboard/subreddit-selector";
import { KeywordInput } from "@/components/dashboard/keyword-input";
import { AnalyzeButton } from "@/components/dashboard/analyze-button";
import { ResultsView } from "@/components/dashboard/results-view";

export default function Home() {
  const [subreddits, setSubreddits] = React.useState<string[]>([]);
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [analysisResults, setAnalysisResults] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleAnalyze = async () => {
    if (subreddits.length === 0 || keywords.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setShowResults(false);

    try {
      const response = await fetch("/api/reddit/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subreddits,
          keywords,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid request");
        } else {
          throw new Error("Failed to analyze data");
        }
      }

      const data = await response.json();
      setAnalysisResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = subreddits.length > 0 && keywords.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-[#6b21a8] mb-4">
            Reddit Demand Radar
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover market opportunities by analyzing Reddit discussions. Find
            what people are talking about and identify demand signals.
          </p>
        </motion.div>

        {/* Main Dashboard */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Input Forms */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Subreddit Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Subreddits</CardTitle>
                <CardDescription>
                  Choose the communities you want to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubredditSelector
                  subreddits={subreddits}
                  onSubredditsChange={setSubreddits}
                />
              </CardContent>
            </Card>

            {/* Keyword Input */}
            <Card>
              <CardHeader>
                <CardTitle>Target Keywords</CardTitle>
                <CardDescription>
                  Enter keywords to search for in Reddit posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeywordInput
                  keywords={keywords}
                  onKeywordsChange={setKeywords}
                />
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <AnalyzeButton
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!canAnalyze}
            />
          </motion.div>

          {/* Right Column - Stats/Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subreddits</span>
                  <span className="text-2xl font-bold text-[#6b21a8]">
                    {subreddits.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Keywords</span>
                  <span className="text-2xl font-bold text-[#6b21a8]">
                    {keywords.length}
                  </span>
                </div>
                <div className="pt-4 border-t border-[#e9d5ff]">
                  <p className="text-xs text-gray-500">
                    Ready to analyze when both subreddits and keywords are
                    provided.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Section */}
        {showResults && analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <ResultsView results={analysisResults} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
