"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StaticKeywords } from "./static-keywords";

interface KeywordSuggestion {
  keyword: string;
  results: number;
}

interface KeywordInputProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

export function KeywordInput({
  keywords,
  onKeywordsChange,
}: KeywordInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<KeywordSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const fetchSuggestions = React.useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/keyword-suggestions?q=${encodeURIComponent(query)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(
            data.filter(
              (s: KeywordSuggestion) => !keywords.includes(s.keyword),
            ),
          );
          setShowSuggestions(data.length > 0);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching keyword suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    },
    [keywords],
  );

  // Handle input change with debounce
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setShowSuggestions(false);
      setSelectedIndex(-1);

      // Clear previous timer
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timer (300ms debounce)
      debounceTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    },
    [fetchSuggestions],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [fetchSuggestions]);

  const handleAdd = (keyword?: string) => {
    const value = keyword || inputValue.trim();
    if (value && !keywords.includes(value)) {
      onKeywordsChange([...keywords, value]);
      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleStaticKeywordClick = (keyword: string) => {
    if (keywords.includes(keyword)) {
      handleRemove(keyword);
    } else {
      handleAdd(keyword);
    }
  };

  const handleRemove = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter((k) => k !== keywordToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleAdd(suggestions[selectedIndex].keyword);
      } else {
        handleAdd();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
      setShowSuggestions(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Static Keyword Suggestions */}
      <StaticKeywords
        selectedKeywords={keywords}
        onKeywordClick={handleStaticKeywordClick}
      />

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder="e.g., SaaS, AI tools, productivity apps"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="flex-1"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-[#6b21a8]" />
            </div>
          )}

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2 w-full rounded-lg border-2 border-[#e9d5ff] bg-white shadow-lg shadow-purple-500/10"
              >
                <div className="max-h-60 overflow-y-auto p-1">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.keyword}
                      onClick={() => handleAdd(suggestion.keyword)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        index === selectedIndex
                          ? "bg-[#f5f3ff] text-[#6b21a8]"
                          : "text-gray-700 hover:bg-[#f5f3ff]"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {suggestion.keyword}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          onClick={() => handleAdd()}
          variant="outline"
          size="default"
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {keywords.map((keyword) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <Badge variant="secondary" className="group">
                  {keyword}
                  <button
                    onClick={() => handleRemove(keyword)}
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

      <p className="mt-2 text-xs text-gray-500">
        Enter keywords to search for in Reddit posts. Click the field to see
        popular suggestions.
      </p>
    </motion.div>
  );
}
