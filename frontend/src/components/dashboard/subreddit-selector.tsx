"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SubredditSelectorProps {
  subreddits: string[];
  onSubredditsChange: (subreddits: string[]) => void;
}

export function SubredditSelector({
  subreddits,
  onSubredditsChange,
}: SubredditSelectorProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !subreddits.includes(trimmed)) {
      onSubredditsChange([...subreddits, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (subreddit: string) => {
    onSubredditsChange(subreddits.filter((s) => s !== subreddit));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="e.g., r/startups, r/entrepreneur"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          onClick={handleAdd}
          variant="outline"
          size="default"
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {subreddits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {subreddits.map((subreddit) => (
              <motion.div
                key={subreddit}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <Badge variant="secondary" className="group">
                  r/{subreddit}
                  <button
                    onClick={() => handleRemove(subreddit)}
                    className="ml-2 rounded-full hover:bg-[#6b21a8]/20 p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
