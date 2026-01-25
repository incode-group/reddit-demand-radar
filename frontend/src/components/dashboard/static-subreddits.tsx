"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Code, Rocket, TrendingUp, Megaphone, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaticSubreddit {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const STATIC_SUBREDDITS: StaticSubreddit[] = [
  {
    name: "webdev",
    icon: <Code className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    name: "startups",
    icon: <Rocket className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    name: "marketing",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    name: "digital_marketing",
    icon: <Megaphone className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    name: "Entrepreneur",
    icon: <Briefcase className="h-4 w-4" />,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
];

interface StaticSubredditsProps {
  selectedSubreddits: string[];
  onSubredditClick: (subreddit: string) => void;
}

export function StaticSubreddits({
  selectedSubreddits,
  onSubredditClick,
}: StaticSubredditsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">Quick Select</p>
      <div className="flex flex-wrap gap-2">
        {STATIC_SUBREDDITS.map((subreddit) => {
          const isSelected = selectedSubreddits.includes(subreddit.name);
          return (
            <motion.button
              key={subreddit.name}
              onClick={() => onSubredditClick(subreddit.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#6b21a8] text-white border-[#6b21a8]"
                    : `${subreddit.color} hover:opacity-80`
                }`}
              >
                {subreddit.icon}
                <span>r/{subreddit.name}</span>
              </Badge>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
