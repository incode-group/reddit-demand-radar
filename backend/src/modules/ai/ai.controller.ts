import { Body, Controller, Post } from "@nestjs/common";
import { AIService } from "./ai.service";
import { GeminiProvider } from "./providers/gemini.provider";
import { AnalysisInput } from "./interfaces/ai-provider.interface";

@Controller("ai")
export class AiController {
  constructor(
    private readonly aiService: AIService,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  @Post("analyze")
  async analyzeContent(@Body() request: any) {
    return this.aiService.analyzeContent(request);
  }

  @Post("test-gemini")
  async testGemini(@Body() input: AnalysisInput) {
    return this.geminiProvider.analyzeText(input);
  }
}
