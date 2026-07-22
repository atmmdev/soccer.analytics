import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudyTicketStatus } from '@prisma/client';

export class UpdateStudyLegDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsNumber()
  builderGroup?: number | null;

  @IsOptional()
  @IsString()
  matchLabel?: string;

  @IsOptional()
  @IsString()
  matchDate?: string | null;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsString()
  selection?: string;

  @IsOptional()
  @IsString()
  period?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  odd?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  boostedOdd?: number | null;

  @IsOptional()
  @IsEnum(StudyTicketStatus)
  status?: StudyTicketStatus | null;

  @IsOptional()
  @IsNumber()
  progressValue?: number | null;

  @IsOptional()
  @IsNumber()
  progressLine?: number | null;
}

export class UpdateStudyTicketDto {
  @IsOptional()
  @IsString()
  bet365Ref?: string | null;

  @IsOptional()
  @IsDateString()
  placedAt?: string;

  @IsOptional()
  @IsString()
  betType?: string | null;

  @IsOptional()
  @IsString()
  betLabel?: string | null;

  @IsOptional()
  @IsEnum(StudyTicketStatus)
  status?: StudyTicketStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stake?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitStake?: number | null;

  @IsOptional()
  @IsNumber()
  numBets?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  combinedOdd?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  potentialReturn?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualReturn?: number | null;

  @IsOptional()
  @IsDateString()
  cashOutAt?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cashOutValue?: number | null;

  @IsOptional()
  @IsBoolean()
  hasOddsBoost?: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStudyLegDto)
  legs?: UpdateStudyLegDto[];
}

export class ImportStudyTicketDto {
  @IsString()
  /** Caminho relativo a docs/betting/data/bilhetes/... ou absoluto */
  filePath: string;
}
