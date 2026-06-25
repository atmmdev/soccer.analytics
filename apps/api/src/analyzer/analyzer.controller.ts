import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyzerService } from './analyzer.service';
import { AnalyzeMatchDto } from './dto/analyze-match.dto';

@ApiTags('analyzer')
@Controller('analyzer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyzerController {
  constructor(private analyzerService: AnalyzerService) {}

  @Get('matches/:id')
  @ApiOperation({ summary: 'Analyze match — team comparison by period and view' })
  analyze(@Param('id') id: string, @Query() query: AnalyzeMatchDto) {
    return this.analyzerService.analyzeMatch(
      id,
      query.period ?? 10,
      query.view ?? 'home',
    );
  }
}
