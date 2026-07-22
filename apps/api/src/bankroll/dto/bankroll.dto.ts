import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
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

export class CreateBankrollPeriodDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(0.01)
  initialAmount: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CloseBankrollPeriodDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SettleTicketDto {
  @IsIn(['WON', 'LOST', 'VOID'])
  result: 'WON' | 'LOST' | 'VOID';
}
