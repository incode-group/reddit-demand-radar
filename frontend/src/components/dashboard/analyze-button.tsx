"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function AnalyzeButton({
  onClick,
  isLoading,
  disabled,
}: AnalyzeButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Button
        onClick={onClick}
        isLoading={isLoading}
        disabled={disabled || isLoading}
        size="lg"
        className="w-full group relative overflow-hidden"
      >
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={{ duration: 1.5, repeat: isLoading ? Infinity : 0 }}
        >
          {isLoading ? (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Search & Analyze</span>
            </>
          )}
        </motion.div>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </Button>
    </motion.div>
  );
}
