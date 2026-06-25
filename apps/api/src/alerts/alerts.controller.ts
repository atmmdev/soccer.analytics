import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'EV+ alerts for upcoming matches (today and tomorrow)' })
  findAll() {
    return this.alertsService.getAlerts();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Alert counts for header badge' })
  summary() {
    return this.alertsService.getSummary();
  }
}
