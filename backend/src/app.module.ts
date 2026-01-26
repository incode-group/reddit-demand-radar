import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppConfigModule } from "./config/config.module";
import { AIModule } from "./modules/ai/ai.module";
import { AnalysisModule } from "./modules/analysis/analysis.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { KeywordSuggestionsModule } from "./modules/keyword-suggestions/keyword-suggestions.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { RedisModule } from "./modules/redis/redis.module";
import { RedditModule } from "./modules/reddit/reddit.module";
import { StatusModule } from "./modules/status/status.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
    AppConfigModule,
    PrismaModule,
    RedisModule,
    AIModule,
    AnalysisModule,
    AnalyticsModule,
    StatusModule,
    RedditModule,
    KeywordSuggestionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
