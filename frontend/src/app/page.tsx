"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubredditSelector } from "@/components/dashboard/subreddit-selector";
import { KeywordInput } from "@/components/dashboard/keyword-input";
import { AnalyzeButton } from "@/components/dashboard/analyze-button";
import { ResultsView } from "@/components/dashboard/results-view";

export default function Home() {
  const [subreddits, setSubreddits] = React.useState<string[]>([]);
  const [keywords, setKeywords] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);

  const handleAnalyze = async () => {
    if (subreddits.length === 0 || !keywords.trim()) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const canAnalyze = subreddits.length > 0 && keywords.trim().length > 0;

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
            Discover market opportunities by analyzing Reddit discussions.
            Find what people are talking about and identify demand signals.
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
                    {keywords.split(",").filter((k) => k.trim()).length || 0}
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

        {/* Results Section */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <ResultsView />
          </motion.div>
        )}
      </div>
    </div>
  );
}
