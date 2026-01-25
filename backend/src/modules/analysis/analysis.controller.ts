import { Body, Controller, Post } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalyzeRequestDto } from "./dto/analyze-request.dto";

@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post("analyze")
  async analyzeContent(@Body() analyzeRequestDto: AnalyzeRequestDto) {
    return this.analysisService.analyzeContent(analyzeRequestDto);
  }
}
