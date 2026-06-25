import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SyncService } from './sync.service';

@ApiTags('sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Get('status')
  @ApiOperation({ summary: 'Daily sync status' })
  status() {
    return this.syncService.getStatus();
  }

  @Post('ensure')
  @ApiOperation({ summary: 'Ensure daily sync is running or up to date' })
  ensure() {
    return this.syncService.ensureDailySync();
  }

  @Post('run')
  @ApiOperation({ summary: 'Force full daily sync now' })
  run() {
    return this.syncService.forceSync();
  }
}
