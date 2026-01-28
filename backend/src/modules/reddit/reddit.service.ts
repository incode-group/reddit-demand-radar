import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service";

export interface SubredditSuggestion {
  name: string;
  displayName: string;
  subscribers?: number;
}

export interface RedditAccessToken {
  token: string;
  expiresAt: number;
  createdAt: number;
}

@Injectable()
export class RedditService {
  private readonly searchApiUrl: string;
  private readonly CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
  private readonly RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
  private readonly RATE_LIMIT_COUNT = 60; // 60 requests per minute

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

  private getAccessTokenCacheKey(): string {
    return "reddit:access_token";
  }

  private getRateLimitCacheKey(): string {
    return "reddit:rate_limit";
  }

  private async getAccessToken(): Promise<string> {
    const cacheKey = this.getAccessTokenCacheKey();
    const cachedToken =
      await this.redisService.getJSON<RedditAccessToken>(cacheKey);

    // Check if we have a valid cached token
    if (
      cachedToken &&
      cachedToken.token &&
      cachedToken.expiresAt > Date.now()
    ) {
      console.log("Using cached Reddit access token");
      return cachedToken.token;
    }

    // Token is expired or doesn't exist, fetch a new one
    return this.fetchNewAccessToken();
  }

  private async fetchNewAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>("app.reddit.clientId");
    const secretKey = this.configService.get<string>("app.reddit.secretKey");
    const userAgent = this.configService.get<string>("app.reddit.userAgent");

    if (!clientId || !secretKey) {
      throw new Error(
        "REDDIT_CLIENT_ID and REDDIT_SECRET_KEY must be configured",
      );
    }

    const authString = Buffer.from(`${clientId}:${secretKey}`).toString(
      "base64",
    );

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "User-Agent": userAgent || "RedditDemandRadar/1.0",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authString}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(
        `Reddit OAuth error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.access_token || !data.expires_in) {
      throw new Error("Invalid response from Reddit OAuth endpoint");
    }

    // Store token with expiration time (Reddit tokens typically expire in 1 hour)
    const tokenData: RedditAccessToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000 - 60000, // Subtract 1 minute as buffer
      createdAt: Date.now(),
    };

    await this.redisService.setJSON(
      this.getAccessTokenCacheKey(),
      tokenData,
      data.expires_in,
    );

    console.log("Fetched new Reddit access token");
    return tokenData.token;
  }

  private async checkRateLimit(): Promise<void> {
    const cacheKey = this.getRateLimitCacheKey();
    const current = await this.redisService.get(cacheKey);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= this.RATE_LIMIT_COUNT) {
      throw new Error(
        `Reddit API rate limit exceeded. Maximum ${this.RATE_LIMIT_COUNT} requests per minute.`,
      );
    }
  }

  private async incrementRateLimit(): Promise<void> {
    const cacheKey = this.getRateLimitCacheKey();
    const current = await this.redisService.get(cacheKey);
    const count = current ? parseInt(current, 10) : 0;

    await this.redisService.set(
      cacheKey,
      (count + 1).toString(),
      this.RATE_LIMIT_WINDOW,
    );
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

    // Check rate limit before making API request
    await this.checkRateLimit();

    // Cache miss - fetch from Reddit API
    try {
      const accessToken = await this.getAccessToken();
      const userAgent = this.configService.get<string>("app.reddit.userAgent");

      const fetchOptions: RequestInit = {
        headers: {
          "User-Agent": userAgent || "RedditDemandRadar/1.0",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

      // Increment rate limit counter
      await this.incrementRateLimit();

      return suggestions;
    } catch (error) {
      console.error("Error fetching subreddit suggestions:", error);
      return [];
    }
  }

  async getPosts(subreddit: string, limit: number = 100): Promise<any[]> {
    // Check rate limit before making API request
    await this.checkRateLimit();

    try {
      const accessToken = await this.getAccessToken();
      const userAgent = this.configService.get<string>("app.reddit.userAgent");

      const fetchOptions: RequestInit = {
        headers: {
          "User-Agent": userAgent || "RedditDemandRadar/1.0",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    } finally {
      // Increment rate limit counter
      await this.incrementRateLimit();
    }
  }

  async getComments(postId: string, limit: number = 100): Promise<any[]> {
    // Check rate limit before making API request
    await this.checkRateLimit();

    try {
      const accessToken = await this.getAccessToken();
      const userAgent = this.configService.get<string>("app.reddit.userAgent");

      const fetchOptions: RequestInit = {
        headers: {
          "User-Agent": userAgent || "RedditDemandRadar/1.0",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    } finally {
      // Increment rate limit counter
      await this.incrementRateLimit();
    }
  }
}
