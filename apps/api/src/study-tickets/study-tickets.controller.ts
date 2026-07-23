import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StudyTicketStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudyTicketsService } from './study-tickets.service';
import {
  ImportStudyTicketDto,
  UpdateStudyTicketDto,
} from './dto/study-ticket.dto';

@ApiTags('study-tickets')
@Controller('study-tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudyTicketsController {
  constructor(private service: StudyTicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bilhetes de estudo (Bet365 importados)' })
  findAll(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('status') status?: StudyTicketStatus,
  ) {
    return this.service.findAll({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      status,
    });
  }

  @Get('grouped')
  @ApiOperation({ summary: 'Listar agrupados por ano/mês/dia' })
  findGrouped() {
    return this.service.findGrouped();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do bilhete de estudo' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar bilhete (odds, status, pernas, etc.)' })
  update(@Param('id') id: string, @Body() dto: UpdateStudyTicketDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover bilhete de estudo' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar 1 PDF Bet365 da pasta bilhetes' })
  importPdf(
    @Body() dto: ImportStudyTicketDto,
    @Query('force') force?: string,
  ) {
    return this.service.importFromPdf(dto.filePath, {
      force: force === 'true' || force === '1',
    });
  }

  @Post('import-upload')
  @ApiOperation({ summary: 'Upload de PDF Bet365 → parse + JSON + DB' })
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
  importUpload(
    @UploadedFile()
    file: { buffer?: Buffer; originalname?: string } | undefined,
    @Query('force') force?: string,
  ) {
    return this.service.importFromUpload(
      {
        buffer: file?.buffer as Buffer,
        originalname: file?.originalname ?? 'bilhete.pdf',
      },
      { force: force !== 'false' && force !== '0' },
    );
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview do parse sem salvar' })
  preview(@Body() dto: ImportStudyTicketDto) {
    return this.service.previewParse(dto.filePath);
  }
}
