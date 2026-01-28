"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Code, Rocket, TrendingUp, Megaphone, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaticKeyword {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const STATIC_KEYWORDS: StaticKeyword[] = [
  {
    name: "SaaS",
    icon: <Code className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    name: "AI tools",
    icon: <Rocket className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    name: "productivity",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    name: "marketing",
    icon: <Megaphone className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    name: "startup",
    icon: <Briefcase className="h-4 w-4" />,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
];

interface StaticKeywordsProps {
  selectedKeywords: string[];
  onKeywordClick: (keyword: string) => void;
  disabled?: boolean;
}

export function StaticKeywords({
  selectedKeywords,
  onKeywordClick,
  disabled = false,
}: StaticKeywordsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">Quick Select</p>
      <div className="flex flex-wrap gap-2">
        {STATIC_KEYWORDS.map((keyword) => {
          const isSelected = selectedKeywords.includes(keyword.name);
          return (
            <motion.button
              key={keyword.name}
              onClick={() => onKeywordClick(keyword.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              disabled={disabled}
              className={disabled ? "cursor-not-allowed opacity-50" : ""}
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#6b21a8] text-white border-[#6b21a8]"
                    : `${keyword.color} hover:opacity-80`
                }`}
              >
                {keyword.icon}
                <span>{keyword.name}</span>
              </Badge>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
