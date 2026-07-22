import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BankrollService } from './bankroll.service';
import {
  CloseBankrollPeriodDto,
  CreateBankrollEntryDto,
  CreateBankrollPeriodDto,
  SettleTicketDto,
} from './dto/bankroll.dto';

@ApiTags('bankroll')
@Controller('bankroll')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BankrollController {
  constructor(private bankrollService: BankrollService) {}

  @Get('periods')
  @ApiOperation({ summary: 'List bankroll periods' })
  listPeriods() {
    return this.bankrollService.listPeriods();
  }

  @Post('periods')
  @ApiOperation({ summary: 'Create a new open bankroll period' })
  createPeriod(@Body() dto: CreateBankrollPeriodDto) {
    return this.bankrollService.createPeriod(dto);
  }

  @Post('periods/:id/close')
  @ApiOperation({ summary: 'Close a bankroll period' })
  closePeriod(@Param('id') id: string, @Body() dto: CloseBankrollPeriodDto) {
    return this.bankrollService.closePeriod(id, dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Bankroll KPIs for a period' })
  @ApiQuery({ name: 'periodId', required: false })
  summary(@Query('periodId') periodId?: string) {
    return this.bankrollService.getSummary(periodId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Bankroll evolution chart data' })
  @ApiQuery({ name: 'periodId', required: false })
  history(@Query('periodId') periodId?: string) {
    return this.bankrollService.getHistory(periodId);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Recent bankroll entries' })
  @ApiQuery({ name: 'periodId', required: false })
  entries(@Query('periodId') periodId?: string) {
    return this.bankrollService.getEntries(periodId);
  }

  @Post('entries')
  @ApiOperation({ summary: 'Manual deposit or withdrawal' })
  createEntry(@Body() dto: CreateBankrollEntryDto) {
    return this.bankrollService.createEntry(dto);
  }

  @Post('tickets/:id/place')
  @ApiOperation({ summary: 'Place ticket and deduct stake' })
  placeTicket(@Param('id') id: string) {
    return this.bankrollService.placeTicket(id);
  }

  @Post('tickets/:id/settle')
  @ApiOperation({ summary: 'Settle ticket as WON, LOST or VOID' })
  settleTicket(@Param('id') id: string, @Body() dto: SettleTicketDto) {
    return this.bankrollService.settleTicket(id, dto.result);
  }
}
