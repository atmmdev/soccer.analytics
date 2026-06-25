import { IsEnum, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
}

export class SettleTicketDto {
  @IsIn(['WON', 'LOST', 'VOID'])
  result: 'WON' | 'LOST' | 'VOID';
}
