import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service";

export interface SubredditSuggestion {
  name: string;
  displayName: string;
  subscribers?: number;
}

@Injectable()
export class RedditService {
  private readonly searchApiUrl: string;
  private readonly CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    this.searchApiUrl =
      this.configService.get<string>("app.redditSubredditNameSearchApiUrl") ||
      "https://www.reddit.com/api/search_reddit_names.json";
  }

  private getCacheKey(query: string): string {
    return `reddit:search:${query.trim().toLowerCase()}`;
  }

  async searchSubreddits(query: string): Promise<SubredditSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim().toLowerCase().replace(/^r\//, "");
    const cacheKey = this.getCacheKey(cleanQuery);

    // Check Redis cache first
    try {
      const cached =
        await this.redisService.getJSON<SubredditSuggestion[]>(cacheKey);
      if (cached && Array.isArray(cached)) {
        console.log(`Cache hit for query: ${cleanQuery}`);
        return cached;
      }
    } catch (error) {
      console.error("Redis cache read error:", error);
      // Continue to API call if cache fails
    }

    // Cache miss - fetch from Reddit API
    try {
      const fetchOptions: RequestInit = {
        headers: {
          "User-Agent": "RedditDemandRadar/1.0",
          "Content-Type": "application/json",
        },
      };

      const url = `${this.searchApiUrl}?query=${encodeURIComponent(
        cleanQuery,
      )}&include_over_18=false`;

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      let suggestions: SubredditSuggestion[] = [];

      // Reddit API returns an object with 'names' array
      if (data.names && Array.isArray(data.names)) {
        suggestions = data.names.map((name: string) => ({
          name: name.toLowerCase(),
          displayName: name,
        }));
      } else if (Array.isArray(data)) {
        // Fallback: if response is directly an array
        suggestions = data.map((name: string) => ({
          name: name.toLowerCase(),
          displayName: name,
        }));
      }

      // Store in Redis cache for 7 days
      if (suggestions.length > 0) {
        try {
          await this.redisService.setJSON(
            cacheKey,
            suggestions,
            this.CACHE_TTL_SECONDS,
          );
          console.log(`Cached search results for query: ${cleanQuery}`);
        } catch (error) {
          console.error("Redis cache write error:", error);
          // Continue even if cache write fails
        }
      }

      return suggestions;
    } catch (error) {
      console.error("Error fetching subreddit suggestions:", error);
      return [];
    }
  }

  async getPosts(subreddit: string, limit: number = 100): Promise<any[]> {
    try {
      const fetchOptions: RequestInit = {
        headers: {
          "User-Agent": "RedditDemandRadar/1.0",
          "Content-Type": "application/json",
        },
      };

      const url = `https://oauth.reddit.com/r/${subreddit}/new.json?limit=${limit}`;

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.children) {
        return data.data.children.map((child: any) => ({
          id: child.data.id,
          title: child.data.title,
          selftext: child.data.selftext,
          author: child.data.author,
          distinguished: child.data.distinguished,
          created_utc: child.data.created_utc,
          score: child.data.score,
          num_comments: child.data.num_comments,
          subreddit: child.data.subreddit,
          url: child.data.url,
        }));
      }

      return [];
    } catch (error) {
      console.error(`Error fetching posts for subreddit ${subreddit}:`, error);
      throw error;
    }
  }

  async getComments(postId: string, limit: number = 100): Promise<any[]> {
    try {
      const fetchOptions: RequestInit = {
        headers: {
          "User-Agent": "RedditDemandRadar/1.0",
          "Content-Type": "application/json",
        },
      };

      const url = `https://oauth.reddit.com/comments/${postId}.json?limit=${limit}`;

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      if (
        data &&
        Array.isArray(data) &&
        data.length > 1 &&
        data[1].data.children
      ) {
        return data[1].data.children
          .filter((child: any) => child.kind === "t1") // Filter only comments (not more comments)
          .map((child: any) => ({
            id: child.data.id,
            body: child.data.body,
            author: child.data.author,
            created_utc: child.data.created_utc,
            score: child.data.score,
            subreddit: child.data.subreddit,
            post_id: postId,
          }));
      }

      return [];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  }
}
