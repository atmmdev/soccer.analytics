import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchesService } from './matches.service';
import { MatchQueryDto } from './dto/match-query.dto';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'List matches with filters' })
  findAll(@Query() query: MatchQueryDto) {
    return this.matchesService.findAll(query);
  }

  @Get('competitions')
  @ApiOperation({ summary: 'List competitions' })
  getCompetitions() {
    return this.matchesService.getCompetitions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match details' })
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }
}
