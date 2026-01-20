import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AIService, AI_PROVIDER_TOKEN } from './ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AIProvider } from './interfaces/ai-provider.interface';

const aiProviderFactory = (
  configService: ConfigService,
): AIProvider => {
  const provider = configService.get<'openai' | 'gemini'>('app.aiProvider');
  
  if (provider === 'gemini') {
    return new GeminiProvider(configService);
  }
  
  return new OpenAIProvider(configService);
};

const aiProvider: Provider = {
  provide: AI_PROVIDER_TOKEN,
  useFactory: aiProviderFactory,
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [AIService, aiProvider, OpenAIProvider, GeminiProvider],
  exports: [AIService],
})
export class AIModule {}
