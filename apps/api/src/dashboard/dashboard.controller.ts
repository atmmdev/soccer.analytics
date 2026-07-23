import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data' })
  getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @Get('match-analysis/:matchId')
  @ApiOperation({ summary: 'Get quick match analysis for dashboard card' })
  getMatchAnalysis(@Param('matchId') matchId: string) {
    return this.dashboardService.getMatchAnalysis(matchId);
  }
}
