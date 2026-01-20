"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface KeywordInputProps {
  keywords: string;
  onKeywordsChange: (keywords: string) => void;
}

export function KeywordInput({ keywords, onKeywordsChange }: KeywordInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Input
        placeholder="e.g., SaaS, AI tools, productivity apps"
        value={keywords}
        onChange={(e) => onKeywordsChange(e.target.value)}
        className="w-full"
      />
      <p className="mt-2 text-xs text-gray-500">
        Enter keywords separated by commas to search for in Reddit posts
      </p>
    </motion.div>
  );
}
