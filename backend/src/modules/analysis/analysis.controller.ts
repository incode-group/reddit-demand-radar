import { Body, Controller, Post, Req } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalyzeRequestDto } from "./dto/analyze-request.dto";
import { Request } from "express";
import { StatusService } from "../status/status.service";

@Controller("analysis")
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly statusService: StatusService,
  ) {}

  @Post("analyze")
  async analyzeContent(
    @Body() analyzeRequestDto: AnalyzeRequestDto,
    @Req() request: Request,
  ): Promise<{ requestId: string }> {
    // Create request immediately and return request ID
    const status = await this.statusService.createRequest(
      analyzeRequestDto.subreddits,
      analyzeRequestDto.keywords,
    );

    // Start analysis in background without awaiting
    this.analysisService
      .analyzeContent(status.id, analyzeRequestDto, request)
      .catch((err) => {
        console.error("Background analysis failed", err);
      });

    return { requestId: status.id };
  }
}
