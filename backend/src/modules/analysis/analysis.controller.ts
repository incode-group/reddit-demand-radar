import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalyzeRequestDto } from './dto/analyze-request.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('search')
  async search(@Body() dto: AnalyzeRequestDto) {
    return this.analysisService.analyze(dto);
  }
}
