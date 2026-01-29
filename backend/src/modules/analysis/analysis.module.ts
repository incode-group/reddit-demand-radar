import { Module } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalysisController } from "./analysis.controller";
import { RedditModule } from "../reddit/reddit.module";
import { AIModule } from "../ai/ai.module";
import { RedisModule } from "../redis/redis.module";
import { AnalyticsModule } from "../analytics/analytics.module";
import { StatusModule } from "../status/status.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    RedditModule,
    AIModule,
    RedisModule,
    AnalyticsModule,
    StatusModule,
    PrismaModule,
  ],
  providers: [AnalysisService],
  controllers: [AnalysisController],
})
export class AnalysisModule {}
