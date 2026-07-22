import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalysisService } from './analysis.service';

@ApiTags('analysis')
@Controller('analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Post('matches/:id/run')
  @ApiOperation({ summary: 'Run analysis engine and save snapshot' })
  run(@Param('id') id: string, @Query('period') period?: string) {
    return this.analysisService.runAnalysis(id, period ? parseInt(period, 10) : 10);
  }

  @Get('matches/:id/latest')
  @ApiOperation({ summary: 'Get latest analysis for match' })
  getLatest(@Param('id') id: string) {
    return this.analysisService.getLatest(id);
  }

  @Post('snapshots/:id/resolve')
  @ApiOperation({ summary: 'Update snapshot with actual match result' })
  resolve(@Param('id') id: string) {
    return this.analysisService.resolveSnapshot(id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Analysis snapshot history with accuracy tracking' })
  history(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: 'all' | 'resolved' | 'pending',
  ) {
    return this.analysisService.getHistory(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status ?? 'all',
    );
  }

  @Get('markets/ev-plus')
  @ApiOperation({ summary: 'List EV+ markets from recent analyses' })
  evPlus() {
    return this.analysisService.getEvPlusMarkets();
  }

  @Get('league-ticket-suggestions')
  @ApiOperation({
    summary:
      'Sugestões por campeonato: 6 múltiplas 1X2 + 4 placares H2H + 4 pós-análise (mercados). Sem competitionId retorna só a lista.',
  })
  leagueTicketSuggestions(
    @Query('legs') legs?: string,
    @Query('competitionId') competitionId?: string,
  ) {
    return this.analysisService.getLeagueTicketSuggestions(
      legs ? parseInt(legs, 10) : 3,
      competitionId || undefined,
    );
  }

  @Get('markets')
  @ApiOperation({ summary: 'List analyzed markets (all, ev-plus, or bet)' })
  markets(
    @Query('filter') filter?: 'all' | 'ev-plus' | 'bet',
    @Query('competitionId') competitionId?: string,
  ) {
    return this.analysisService.getAnalyzedMarkets(
      filter ?? 'all',
      competitionId || undefined,
    );
  }
}
