import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BankrollService } from './bankroll.service';
import { CreateBankrollEntryDto, SettleTicketDto } from './dto/bankroll.dto';

@ApiTags('bankroll')
@Controller('bankroll')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BankrollController {
  constructor(private bankrollService: BankrollService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Bankroll KPIs' })
  summary() {
    return this.bankrollService.getSummary();
  }

  @Get('history')
  @ApiOperation({ summary: 'Bankroll evolution chart data' })
  history() {
    return this.bankrollService.getHistory();
  }

  @Get('entries')
  @ApiOperation({ summary: 'Recent bankroll entries' })
  entries() {
    return this.bankrollService.getEntries();
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
