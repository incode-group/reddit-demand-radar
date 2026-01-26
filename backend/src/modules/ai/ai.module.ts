import { Module, Provider } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AIService, AI_PROVIDER_TOKEN } from "./ai.service";
import { OpenAIProvider } from "./providers/openai.provider";
import { GeminiProvider } from "./providers/gemini.provider";
import {
  AIProvider,
  AiProviderInterface,
} from "./interfaces/ai-provider.interface";
import { AiController } from "./ai.controller";
import { AnalyticsService } from "../analytics/analytics.service";
import { AnalyticsModule } from "../analytics/analytics.module";

const aiProviderFactory = (
  configService: ConfigService,
  analyticsService: AnalyticsService, // Добавляем сюда
): AiProviderInterface => {
  const provider = configService.get<"openai" | "gemini">("app.aiProvider");

  if (provider === "gemini") {
    return new GeminiProvider(analyticsService);
  }

  return new OpenAIProvider(configService);
};

const aiProvider: Provider = {
  provide: AI_PROVIDER_TOKEN,
  useFactory: aiProviderFactory,
  inject: [ConfigService, AnalyticsService],
};

@Module({
  imports: [ConfigModule, AnalyticsModule],
  providers: [AIService, aiProvider, OpenAIProvider, GeminiProvider],
  controllers: [AiController],
  exports: [AIService, GeminiProvider],
})
export class AIModule {}
