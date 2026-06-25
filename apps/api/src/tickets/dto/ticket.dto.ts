import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MarketType } from '@prisma/client';

export class TicketSelectionDto {
  @IsString()
  matchId: string;

  @IsEnum(MarketType)
  marketType: MarketType;

  @IsString()
  selection: string;

  @IsNumber()
  @Min(1.01)
  odd: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  probability?: number;

  @IsOptional()
  @IsNumber()
  ev?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  confidence?: number;
}

export class CalculateTicketDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketSelectionDto)
  selections: TicketSelectionDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  stake?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bankroll?: number;
}

export class CreateTicketDto extends CalculateTicketDto {
  @IsOptional()
  @IsString()
  name?: string;
}
