"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageSquare, ArrowUpRight } from "lucide-react";

interface MatchResult {
  id: string;
  subreddit: string;
  title: string;
  score: number;
  comments: number;
  url: string;
  keyword: string;
  relevance: number;
}

interface ResultsViewProps {
  results: MatchResult[];
}

const mockResults: MatchResult[] = [
  {
    id: "1",
    subreddit: "startups",
    title: "Building a SaaS product - need advice on pricing",
    score: 245,
    comments: 89,
    url: "#",
    keyword: "SaaS",
    relevance: 95,
  },
  {
    id: "2",
    subreddit: "entrepreneur",
    title: "AI tools that actually save time - what are you using?",
    score: 189,
    comments: 156,
    url: "#",
    keyword: "AI tools",
    relevance: 88,
  },
  {
    id: "3",
    subreddit: "productivity",
    title: "Best productivity apps for remote teams in 2024",
    score: 312,
    comments: 203,
    url: "#",
    keyword: "productivity apps",
    relevance: 92,
  },
  {
    id: "4",
    subreddit: "startups",
    title: "How to validate your SaaS idea before building",
    score: 178,
    comments: 67,
    url: "#",
    keyword: "SaaS",
    relevance: 85,
  },
];

export function ResultsView({ results = mockResults }: ResultsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#6b21a8]">
          Analysis Results
        </h2>
        <Badge variant="secondary" className="text-sm">
          {results.length} matches found
        </Badge>
      </div>

      <AnimatePresence mode="popLayout">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            layout
          >
            <Card className="hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-[#7c3aed] transition-colors">
                      {result.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        r/{result.subreddit}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Keyword: <span className="font-medium">{result.keyword}</span>
                      </span>
                    </CardDescription>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUpRight className="h-5 w-5 text-[#6b21a8] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-4 w-4 text-[#6b21a8]" />
                    <span className="font-medium">{result.score}</span>
                    <span className="text-gray-400">upvotes</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageSquare className="h-4 w-4 text-[#6b21a8]" />
                    <span className="font-medium">{result.comments}</span>
                    <span className="text-gray-400">comments</span>
                  </div>
                  <div className="ml-auto">
                    <Badge
                      variant={
                        result.relevance >= 90
                          ? "default"
                          : result.relevance >= 80
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {result.relevance}% relevant
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
