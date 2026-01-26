import { Body, Controller, Post, Req } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalyzeRequestDto } from "./dto/analyze-request.dto";
import { Request } from "express";

@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post("analyze")
  async analyzeContent(
    @Body() analyzeRequestDto: AnalyzeRequestDto,
    @Req() request: Request,
  ) {
    return this.analysisService.analyzeContent(analyzeRequestDto, request);
  }
}
