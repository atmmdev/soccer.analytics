import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResearchMarket } from '../../engines/simulation-engine/simulation-engine.service';

export class StrategyFiltersDto {
  @IsEnum([
    'HOME_WIN',
    'DRAW',
    'AWAY_WIN',
    'OVER_2_5',
    'UNDER_2_5',
    'BTTS_YES',
    'BTTS_NO',
  ])
  market: ResearchMarket;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsString()
  competition?: string;

  @IsOptional()
  @IsNumber()
  @Min(1.01)
  minOdd?: number;

  @IsOptional()
  @IsNumber()
  @Min(1.01)
  maxOdd?: number;

  @IsNumber()
  @Min(20)
  @Max(500)
  sampleSize: number;

  @IsNumber()
  @Min(1)
  flatStake: number;
}

export class CreateStrategyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => StrategyFiltersDto)
  filters: StrategyFiltersDto;
}
