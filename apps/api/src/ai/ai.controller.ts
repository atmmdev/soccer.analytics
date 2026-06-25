import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { MatchExplainInput } from '../engines/ai-engine/ai-engine.service';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('matches/:id/explain')
  @ApiOperation({ summary: 'Explain latest match analysis' })
  explainMatch(@Param('id') id: string) {
    return this.aiService.explainMatch(id);
  }

  @Post('explain')
  @ApiOperation({ summary: 'Explain analysis from provided data' })
  explain(@Body() body: MatchExplainInput) {
    return this.aiService.explainFromData(body);
  }
}
