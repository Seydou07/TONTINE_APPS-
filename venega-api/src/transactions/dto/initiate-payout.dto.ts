import { IsInt, IsPositive, IsString } from 'class-validator';
import type { InitiatePayoutDto as InitiatePayoutDtoShape } from '@venega/types';

export class InitiatePayoutDto implements InitiatePayoutDtoShape {
  @IsString()
  circleId: string;

  @IsString()
  cycleId: string;

  @IsString()
  beneficiaryUserId: string;

  @IsInt()
  @IsPositive()
  amount: number;
}
