import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service";
import axios from "axios";

export interface KeywordSuggestion {
  keyword: string;
  results: number;
}

@Injectable()
export class KeywordSuggestionsService {
  private readonly cacheTTL = 3600; // 1 hour in seconds
  private readonly defaultKeywords = [
    "SaaS",
    "AI tools",
    "productivity apps",
    "remote work",
    "startup ideas",
    "marketing automation",
    "e-commerce",
    "content creation",
    "web development",
    "mobile apps",
  ];

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async getSuggestions(query: string): Promise<KeywordSuggestion[]> {
    console.log("received query:", query);

    if (!query || query.trim().length < 2) {
      return this.getDefaultSuggestions();
    }

    const cacheKey = `keyword_suggestions:${query.toLowerCase()}`;

    // Check cache first
    const cached =
      await this.redisService.getJSON<KeywordSuggestion[]>(cacheKey);
    if (cached) {
      console.log("returning cached suggestions for query:", query);

      return cached;
    }

    try {
      console.log("calling fetchGoogleSuggestions with query:", query);

      const suggestions = await this.fetchGoogleSuggestions(query);

      await this.redisService.setJSON(cacheKey, suggestions, this.cacheTTL);
      return suggestions;
    } catch (error) {
      console.error("Error fetching keyword suggestions:", error);
      return this.getDefaultSuggestions();
    }
  }

  private async fetchGoogleSuggestions(
    query: string,
  ): Promise<KeywordSuggestion[]> {
    const apiUrl = this.configService.get<string>("GOOGLE_SUGGEST_API_URL");
    if (!apiUrl) {
      throw new Error("GOOGLE_SUGGEST_API_URL not configured");
    }

    try {
      const response = await axios.get(apiUrl, {
        params: {
          client: "firefox",
          q: query,
        },
        timeout: 5000,
      });

      console.log(
        "received response from Google Suggest API for query:",
        response.data,
      );

      // Google Suggest API returns JSONP format: window.google.ac.h([...])
      // We need to parse this carefully
      const data = response.data;
      if (typeof data === "string" && data.includes("window.google.ac.h")) {
        // Extract the JSON part from the JSONP response
        const jsonMatch = data.match(/window\.google\.ac\.h\((.+)\)/);
        if (jsonMatch && jsonMatch[1]) {
          const suggestionsData = JSON.parse(jsonMatch[1]);
          return this.processSuggestions(suggestionsData, query);
        }
      }

      // Fallback for direct JSON response
      if (Array.isArray(data) && data.length >= 2) {
        return this.processSuggestions(data[1], query);
      }

      return [];
    } catch (error) {
      console.error("Google Suggest API error:", error);
      throw error;
    }
  }

  private processSuggestions(
    suggestionsData: any[],
    query: string,
  ): KeywordSuggestion[] {
    if (!Array.isArray(suggestionsData)) {
      return [];
    }

    return suggestionsData
      .map((keyword: any) => {
        return {
          keyword: keyword.toString(),
          results: Math.floor(Math.random() * 5000) + 500,
        };
      })
      .slice(0, 10);
  }

  private getDefaultSuggestions(): KeywordSuggestion[] {
    return this.defaultKeywords.map((keyword) => ({
      keyword,
      results: Math.floor(Math.random() * 1000) + 100, // Mock results count
    }));
  }
}
