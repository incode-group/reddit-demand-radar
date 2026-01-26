import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { RedditService } from "../reddit/reddit.service";
import { GeminiProvider } from "../ai/providers/gemini.provider";
import { AnalyzeRequestDto } from "./dto/analyze-request.dto";
import {
  AnalysisInput,
  AnalysisResult,
  CommentsAnalysisInput,
  CommentsAnalysisResult,
} from "../ai/interfaces/ai-provider.interface";
import * as natural from "natural";
import { RedisService } from "../redis/redis.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { Logger } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class AnalysisService {
  private readonly RATE_LIMIT = 100;
  private readonly RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
  private readonly REQUEST_DELAY = 2500; // 2.5 seconds in milliseconds
  private readonly logger = new Logger(AnalysisService.name);

  private readonly MAX_SUBREDDITS_COUNT = 1;
  private readonly MAX_KEYWORDS_COUNT = 3;

  constructor(
    private readonly redis: RedisService,
    private redditService: RedditService,
    private geminiProvider: GeminiProvider,
    private analyticsService: AnalyticsService,
  ) {}

  async analyzeContent(
    request: AnalyzeRequestDto,
    httpRequest: Request,
  ): Promise<any> {
    this.logger.log(
      `Starting analysis for subreddits: [${request.subreddits.join(", ")}] with keywords: [${request.keywords.join(", ")}]`,
    );

    // Input validation
    this.validateInput(request);

    // Rate limiting check
    await this.checkRateLimit();

    // Get Reddit data
    const redditData = await this.fetchRedditData(request);
    this.logger.log(`Fetched ${redditData.length} posts from Reddit`);

    // Multi-stage filtering
    const filteredData = this.applyMultiStageFiltering(
      redditData,
      request.keywords,
    );
    this.logger.log(
      `Filtered data: ${redditData.length} -> ${filteredData.length} posts (${Math.round((filteredData.length / redditData.length) * 100)}%)`,
    );

    // AI analysis for posts
    const analysisResults = await this.performAIAnalysis(
      filteredData,
      request.keywords,
    );
    const highIntentResults = analysisResults.filter(
      (result) => result.mentioned,
    );
    this.logger.log(
      `Posts AI analysis completed: ${analysisResults.length} analyzed, ${highIntentResults.length} high-intent matches found`,
    );

    // Comments analysis
    const commentsAnalysisResults = await this.performCommentsAnalysis(
      filteredData,
      request.keywords,
    );
    const highIntentCommentResults = commentsAnalysisResults.filter(
      (result) => result.mentioned,
    );
    this.logger.log(
      `Comments analysis completed: ${commentsAnalysisResults.length} analyzed, ${highIntentCommentResults.length} high-intent matches found`,
    );

    const response = {
      subreddits: request.subreddits,
      keywords: request.keywords,
      totalPosts: redditData.length,
      filteredPosts: filteredData.length,
      analysisResults,
      commentsAnalysisResults,
      highIntentCount: highIntentResults.length,
      highIntentCommentsCount: highIntentCommentResults.length,
      processingTime: new Date().toISOString(),
    };

    this.logger.log(
      `Analysis completed successfully. Response: ${JSON.stringify(response, null, 2)}`,
    );

    // Track Reddit request analytics
    this.analyticsService
      .trackRedditRequest(
        httpRequest,
        request.subreddits,
        request.keywords,
        highIntentResults.length,
        highIntentCommentResults.length,
      )
      .catch((error) =>
        this.logger.error("Failed to track Reddit request:", error),
      );

    return response;
  }

  private validateInput(request: AnalyzeRequestDto) {
    this.logger.log(
      `Validating input: subreddits=${request.subreddits.length}, keywords=${request.keywords.length}`,
    );

    if (!request.subreddits || request.subreddits.length === 0) {
      this.logger.error("Validation failed: No subreddits provided");
      throw new HttpException(
        "At least one subreddit is required",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!request.keywords || request.keywords.length === 0) {
      this.logger.error("Validation failed: No keywords provided");
      throw new HttpException(
        "At least one keyword is required",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (request.subreddits.length > this.MAX_SUBREDDITS_COUNT) {
      this.logger.error(
        `Validation failed: Too many subreddits (${request.subreddits.length}), maximum 3 allowed`,
      );
      throw new HttpException(
        "Maximum 3 subreddits allowed",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (request.keywords.length > this.MAX_KEYWORDS_COUNT) {
      this.logger.error(
        `Validation failed: Too many keywords (${request.keywords.length}), maximum 5 allowed`,
      );
      throw new HttpException(
        "Maximum 5 keywords allowed",
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log("Input validation passed");
  }

  private async checkRateLimit(): Promise<void> {
    const key = "reddit_api_requests";
    const current = await this.redis.get(key);
    const count = current ? parseInt(current, 10) : 0;

    this.logger.log(
      `Rate limit check: ${count}/${this.RATE_LIMIT} requests used`,
    );

    if (count >= this.RATE_LIMIT) {
      this.logger.warn(
        `Rate limit exceeded: ${count}/${this.RATE_LIMIT} requests. Blocking new requests.`,
      );
      throw new HttpException(
        "Rate limit exceeded. Maximum 100 requests per hour.",
        HttpStatus.TOO_MANY_REQUESTS,
        {
          description: "Retry after 1 hour",
        },
      );
    }
  }

  private async incrementRateLimit(): Promise<void> {
    const key = "reddit_api_requests";
    const current = await this.redis.get(key);
    const count = current ? parseInt(current, 10) : 0;

    this.logger.log(`Incrementing rate limit: ${count} -> ${count + 1}`);

    await this.redis.set(key, (count + 1).toString(), this.RATE_LIMIT_WINDOW);
  }

  private async fetchRedditData(request: AnalyzeRequestDto): Promise<any[]> {
    const allPosts: any[] = [];
    const startTime = Date.now();

    this.logger.log(
      `Starting Reddit data fetch for subreddits: [${request.subreddits.join(", ")}]`,
    );

    for (const subreddit of request.subreddits) {
      const subredditStartTime = Date.now();
      this.logger.log(`Fetching posts from r/${subreddit}...`);

      try {
        // Add delay between requests
        await this.delay(this.REQUEST_DELAY);

        const posts = await this.redditService.getPosts(subreddit, 100);

        // Add subreddit name and post link to each post
        const enrichedPosts = posts.map((post) => ({
          ...post,
          subreddit: subreddit,
          postLink:
            post.url || `https://reddit.com/r/${subreddit}/comments/${post.id}`,
        }));

        allPosts.push(...enrichedPosts);

        const subredditDuration = Date.now() - subredditStartTime;
        this.logger.log(
          `Fetched ${posts.length} posts from r/${subreddit} in ${subredditDuration}ms`,
        );

        // Increment rate limit counter
        await this.incrementRateLimit();
      } catch (error) {
        this.logger.error(
          `Error fetching data for subreddit ${subreddit}: ${error.message}`,
        );
        // Continue with other subreddits
      }
    }

    const totalDuration = Date.now() - startTime;
    this.logger.log(
      `Reddit data fetch completed: ${allPosts.length} total posts in ${totalDuration}ms`,
    );

    return allPosts;
  }

  private applyMultiStageFiltering(data: any[], keywords: string[]): any[] {
    const startTime = Date.now();
    this.logger.log(
      `Starting multi-stage filtering for ${data.length} posts with keywords: [${keywords.join(", ")}]`,
    );

    // Stage 1: Garbage Disposal
    const cleanedData = data.filter((item) => {
      // Remove AutoModerator posts
      if (item.author === "AutoModerator") return false;

      // Remove moderator posts
      if (item.distinguished === "moderator") return false;

      // Remove system messages
      const systemStrings = [
        "Your post has been removed",
        "This post has been removed",
        "Your comment has been removed",
        "This comment has been removed",
        "Please follow the rules",
        "Moderator action",
      ];

      const text = (item.title + " " + (item.selftext || "")).toLowerCase();
      if (systemStrings.some((str) => text.includes(str.toLowerCase()))) {
        return false;
      }

      return true;
    });

    const garbageDisposalTime = Date.now() - startTime;
    this.logger.log(
      `Stage 1 - Garbage Disposal: ${data.length} -> ${cleanedData.length} posts (${Math.round((cleanedData.length / data.length) * 100)}%) in ${garbageDisposalTime}ms`,
    );

    // Stage 2: Semantic Keyword Matching
    const filteredData = cleanedData.filter((item) => {
      const text = (item.title + " " + (item.selftext || "")).toLowerCase();
      return this.hasSemanticMatch(text, keywords);
    });

    const semanticFilteringTime = Date.now() - startTime - garbageDisposalTime;
    this.logger.log(
      `Stage 2 - Semantic Filtering: ${cleanedData.length} -> ${filteredData.length} posts (${Math.round((filteredData.length / cleanedData.length) * 100)}%) in ${semanticFilteringTime}ms`,
    );

    const totalTime = Date.now() - startTime;
    this.logger.log(
      `Multi-stage filtering completed: ${data.length} -> ${filteredData.length} posts in ${totalTime}ms`,
    );

    return filteredData;
  }

  private hasSemanticMatch(text: string, keywords: string[]): boolean {
    // Create a tokenizer
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());

    // Simple semantic matching - check for related terms
    const semanticMap = new Map<string, string[]>([
      ["laptop", ["macbook", "workstation", "pc", "computer", "notebook"]],
      ["phone", ["smartphone", "mobile", "cellphone", "device"]],
      ["car", ["vehicle", "automobile", "auto", "truck", "sedan"]],
      ["house", ["home", "apartment", "property", "residence", "dwelling"]],
      ["software", ["app", "application", "program", "tool", "platform"]],
      ["service", ["solution", "offering", "product", "help", "support"]],
      [
        "business",
        ["company", "startup", "enterprise", "organization", "firm"],
      ],
      ["product", ["item", "goods", "merchandise", "commodity", "article"]],
      ["market", ["industry", "sector", "field", "space", "arena"]],
      ["customer", ["client", "user", "buyer", "consumer", "patron"]],
    ]);

    // Check for exact keyword matches
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (text.includes(lowerKeyword)) {
        return true;
      }
    }

    // Check for semantic matches
    for (const token of tokens) {
      for (const [base, related] of semanticMap) {
        if (related.includes(token)) {
          // Check if any of the original keywords are semantically related
          for (const keyword of keywords) {
            if (
              base === keyword.toLowerCase() ||
              related.includes(keyword.toLowerCase())
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private async performAIAnalysis(
    data: any[],
    keywords: string[],
  ): Promise<AnalysisResult[]> {
    const startTime = Date.now();
    this.logger.log(
      `Starting AI analysis for ${data.length} posts with keywords: [${keywords.join(", ")}]`,
    );

    const analysisInputs: AnalysisInput[] = data.map((item) => ({
      text: this.truncateText(item.title + " " + (item.selftext || ""), 500),
      keywords: keywords,
    }));

    this.logger.log(
      `Created ${analysisInputs.length} analysis inputs, each truncated to 500 characters`,
    );

    const analysisResults =
      await this.geminiProvider.analyzeMultiple(analysisInputs);

    // Add subreddit and post link information to analysis results
    const enrichedResults = analysisResults.map((result, index) => ({
      ...result,
      subreddit: data[index]?.subreddit,
      postLink: data[index]?.postLink,
    }));

    const duration = Date.now() - startTime;
    const highIntentResults = enrichedResults.filter(
      (result) => result.mentioned,
    );
    this.logger.log(
      `AI analysis completed in ${duration}ms: ${enrichedResults.length} analyzed, ${highIntentResults.length} high-intent matches found`,
    );

    return enrichedResults;
  }

  private async performCommentsAnalysis(
    data: any[],
    keywords: string[],
  ): Promise<CommentsAnalysisResult[]> {
    const startTime = Date.now();
    this.logger.log(
      `Starting comments analysis for ${data.length} posts with keywords: [${keywords.join(", ")}]`,
    );

    // Fetch comments for each post
    const commentsData: CommentsAnalysisInput[] = [];

    for (const post of data) {
      try {
        // Add delay between comment requests
        await this.delay(this.REQUEST_DELAY);

        const comments = await this.redditService.getComments(post.id, 100);
        const commentBodies = comments.map((comment) => comment.body);

        if (commentBodies.length > 0) {
          commentsData.push({
            postId: post.id,
            comments: commentBodies,
            keywords: keywords,
          });
        }

        // Increment rate limit counter for comments
        await this.incrementRateLimit();
      } catch (error) {
        this.logger.error(
          `Error fetching comments for post ${post.id}: ${error.message}`,
        );
        // Continue with other posts
      }
    }

    this.logger.log(
      `Fetched comments for ${commentsData.length} posts, total comments: ${commentsData.reduce((sum, cd) => sum + cd.comments.length, 0)}`,
    );

    // Analyze comments
    const commentsAnalysisResults =
      await this.geminiProvider.analyzeMultipleComments(commentsData);

    const duration = Date.now() - startTime;
    const highIntentCommentResults = commentsAnalysisResults.filter(
      (result) => result.mentioned,
    );
    this.logger.log(
      `Comments analysis completed in ${duration}ms: ${commentsAnalysisResults.length} analyzed, ${highIntentCommentResults.length} high-intent matches found`,
    );

    return commentsAnalysisResults;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
