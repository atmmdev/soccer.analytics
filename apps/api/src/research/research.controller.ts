import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResearchService } from './research.service';
import { CreateStrategyDto, StrategyFiltersDto } from './dto/research.dto';

@ApiTags('research')
@Controller('research')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResearchController {
  constructor(private researchService: ResearchService) {}

  @Get('strategies')
  @ApiOperation({ summary: 'List research strategies' })
  findAll() {
    return this.researchService.findAll();
  }

  @Get('strategies/:id')
  @ApiOperation({ summary: 'Get strategy with simulations' })
  findOne(@Param('id') id: string) {
    return this.researchService.findOne(id);
  }

  @Post('strategies')
  @ApiOperation({ summary: 'Create hypothesis/strategy' })
  create(@Body() dto: CreateStrategyDto) {
    return this.researchService.create(dto);
  }

  @Delete('strategies/:id')
  @ApiOperation({ summary: 'Delete strategy' })
  remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }

  @Post('strategies/:id/run')
  @ApiOperation({ summary: 'Run simulation for strategy' })
  run(@Param('id') id: string) {
    return this.researchService.runSimulation(id);
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Preview simulation without saving' })
  preview(@Body() filters: StrategyFiltersDto) {
    return this.researchService.runPreview(filters);
  }
}
