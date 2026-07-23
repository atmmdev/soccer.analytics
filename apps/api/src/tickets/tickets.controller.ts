import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import {
  CalculateTicketDto,
  CreateTicketDto,
  UpdateTicketDto,
} from './dto/ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Preview ticket calculation' })
  calculate(@Body() dto: CalculateTicketDto) {
    return this.ticketsService.calculate(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Save ticket' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tickets' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket (stake, status, odds das seleções)' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Post(':id/import-pdf')
  @ApiOperation({
    summary:
      'Atualiza bilhete do sistema a partir de PDF Bet365 (pernas + stake/status)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  importPdf(
    @Param('id') id: string,
    @UploadedFile()
    file: { buffer?: Buffer; originalname?: string } | undefined,
  ) {
    return this.ticketsService.importFromPdf(id, {
      buffer: file?.buffer as Buffer,
      originalname: file?.originalname ?? 'bilhete.pdf',
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ticket' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
