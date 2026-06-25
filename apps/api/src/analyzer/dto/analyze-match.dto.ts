import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export type AnalysisView = 'home' | 'away' | 'h2h';

export class AnalyzeMatchDto {
  @ApiPropertyOptional({ enum: [5, 10, 15, 20], default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsIn([5, 10, 15, 20])
  period?: number = 10;

  @ApiPropertyOptional({ enum: ['home', 'away', 'h2h'], default: 'home' })
  @IsOptional()
  @IsIn(['home', 'away', 'h2h'])
  view?: AnalysisView = 'home';
}
