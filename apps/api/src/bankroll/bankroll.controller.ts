import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  LinkBankrollTicketsDto,
  SettleTicketDto,
  UpdateBankrollEntryDto,
  UpdateBankrollPeriodDto,
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

  @Patch('periods/:id')
  @ApiOperation({ summary: 'Update bankroll period details' })
  updatePeriod(@Param('id') id: string, @Body() dto: UpdateBankrollPeriodDto) {
    return this.bankrollService.updatePeriod(id, dto);
  }

  @Post('periods/:id/close')
  @ApiOperation({ summary: 'Close a bankroll period' })
  closePeriod(@Param('id') id: string, @Body() dto: CloseBankrollPeriodDto) {
    return this.bankrollService.closePeriod(id, dto);
  }

  @Get('periods/:id/correlated-tickets')
  @ApiOperation({
    summary: 'Linked + candidate study/system tickets for a bankroll period',
  })
  correlatedTickets(@Param('id') id: string) {
    return this.bankrollService.getCorrelatedTickets(id);
  }

  @Post('periods/:id/link-tickets')
  @ApiOperation({ summary: 'Link study/system tickets to an open bankroll' })
  linkTickets(@Param('id') id: string, @Body() dto: LinkBankrollTicketsDto) {
    return this.bankrollService.linkTickets(id, dto);
  }

  @Post('periods/:id/unlink-tickets')
  @ApiOperation({ summary: 'Unlink tickets from a bankroll period' })
  unlinkTickets(@Param('id') id: string, @Body() dto: LinkBankrollTicketsDto) {
    return this.bankrollService.unlinkTickets(id, dto);
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

  @Patch('entries/:id')
  @ApiOperation({ summary: 'Update a manual deposit or withdrawal' })
  updateEntry(@Param('id') id: string, @Body() dto: UpdateBankrollEntryDto) {
    return this.bankrollService.updateEntry(id, dto);
  }

  @Delete('entries/:id')
  @ApiOperation({ summary: 'Remove a manual deposit or withdrawal' })
  deleteEntry(@Param('id') id: string) {
    return this.bankrollService.deleteEntry(id);
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
