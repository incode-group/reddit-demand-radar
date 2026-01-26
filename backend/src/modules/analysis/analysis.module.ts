import { Module } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalysisController } from "./analysis.controller";
import { RedditModule } from "../reddit/reddit.module";
import { AIModule } from "../ai/ai.module";
import { RedisModule } from "../redis/redis.module";
import { AnalyticsModule } from "../analytics/analytics.module";

@Module({
  imports: [RedditModule, AIModule, RedisModule, AnalyticsModule],
  providers: [AnalysisService],
  controllers: [AnalysisController],
})
export class AnalysisModule {}
