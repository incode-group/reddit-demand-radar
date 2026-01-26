import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Request } from "express";

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async trackGeminiRequest(
    promptTokens: number,
    completionTokens: number,
    model: string,
  ): Promise<void> {
    try {
      await this.prisma.geminiRequest.create({
        data: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          model,
        },
      });
      this.logger.log(
        `Tracked Gemini request: ${promptTokens} prompt + ${completionTokens} completion tokens = ${promptTokens + completionTokens} total`,
      );
    } catch (error) {
      this.logger.error("Failed to track Gemini request:", error);
    }
  }

  async trackRedditRequest(
    request: Request,
    subreddits: string[],
    keywords: string[],
    subredditsMatchCount: number,
    commentsMatchCount: number,
  ): Promise<void> {
    try {
      const ipAddress = this.getClientIpAddress(request);

      await this.prisma.redditRequest.create({
        data: {
          ipAddress,
          subreddits: JSON.stringify(subreddits),
          keywords: JSON.stringify(keywords),
          subredditsMatchCount,
          commentsMatchCount,
        },
      });
      this.logger.log(
        `Tracked Reddit request from ${ipAddress}: ${subreddits.length} subreddits, ${keywords.length} keywords, ${subredditsMatchCount} subreddit matches, ${commentsMatchCount} comment matches`,
      );
    } catch (error) {
      this.logger.error("Failed to track Reddit request:", error);
    }
  }

  private getClientIpAddress(request: Request): string {
    // Check various headers for IP address
    const forwarded = request.headers["x-forwarded-for"];
    const realIp = request.headers["x-real-ip"];
    const cfConnectingIp = request.headers["cf-connecting-ip"];
    const trueClientIp = request.headers["true-client-ip"];

    // Return the first available IP address
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    }
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }
    if (cfConnectingIp) {
      return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
    }
    if (trueClientIp) {
      return Array.isArray(trueClientIp) ? trueClientIp[0] : trueClientIp;
    }

    // Fallback to direct connection IP
    return request.ip || request.connection.remoteAddress || "unknown";
  }
}
