import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './interfaces/ai-provider.interface';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
} from './interfaces/ai-provider.interface';

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER';

@Injectable()
export class AIService {
  constructor(
    @Inject(AI_PROVIDER_TOKEN) private aiProvider: AIProvider,
    private configService: ConfigService,
  ) {}

  async analyzeContent(
    request: AIAnalysisRequest,
  ): Promise<AIAnalysisResponse> {
    return this.aiProvider.analyzeContent(request);
  }
}
