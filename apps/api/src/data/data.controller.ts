import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DataService } from './data.service';

@ApiTags('data')
@Controller('data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataController {
  constructor(private dataService: DataService) {}

  @Get('status')
  @ApiOperation({ summary: 'Data provider configuration status' })
  status() {
    return this.dataService.getStatus();
  }

  @Post('import/fixtures')
  @ApiOperation({ summary: 'Import fixtures for a date from external API' })
  importFixtures(@Query('date') date?: string) {
    const target = date ?? new Date().toISOString().slice(0, 10);
    return this.dataService.importFixtures(target);
  }

  @Post('import/odds')
  @ApiOperation({ summary: 'Import odds for scheduled matches on a date' })
  importOdds(@Query('date') date?: string) {
    const target = date ?? new Date().toISOString().slice(0, 10);
    return this.dataService.importOdds(target);
  }
}
