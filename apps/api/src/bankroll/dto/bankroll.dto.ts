import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export enum BankrollEntryType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  STAKE = 'STAKE',
  WIN = 'WIN',
  LOSS = 'LOSS',
  REFUND = 'REFUND',
}

export class CreateBankrollEntryDto {
  @IsIn([BankrollEntryType.DEPOSIT, BankrollEntryType.WITHDRAWAL])
  type: BankrollEntryType.DEPOSIT | BankrollEntryType.WITHDRAWAL;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  periodId?: string;
}

export class UpdateBankrollEntryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export class CreateBankrollPeriodDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(0)
  initialAmount: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  /** Fim do período de atuação (ex.: mês Bet365). */
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  /** Fecha sozinha quando endsAt passar. Sem endsAt, só fecha manual. */
  @IsOptional()
  @IsBoolean()
  autoClose?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studyTicketIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ticketIds?: string[];
}

export class UpdateBankrollPeriodDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialAmount?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsDateString()
  endsAt?: string | null;

  @IsOptional()
  @IsBoolean()
  autoClose?: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class CloseBankrollPeriodDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LinkBankrollTicketsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studyTicketIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ticketIds?: string[];
}

export class SettleTicketDto {
  @IsIn(['WON', 'LOST', 'VOID'])
  result: 'WON' | 'LOST' | 'VOID';
}
