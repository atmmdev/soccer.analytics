import {
  IsArray,
  IsDateString,
  IsEnum,
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
  @IsEnum(BankrollEntryType)
  type: BankrollEntryType;

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

  /** Fim do período de atuação (ex.: mês Bet365). Não fecha a banca sozinho. */
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
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
