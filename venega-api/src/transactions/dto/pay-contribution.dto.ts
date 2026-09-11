import { IsIn, IsInt, IsPositive, IsString, Matches } from 'class-validator';
import type { PayContributionDto as PayContributionDtoShape } from '@venega/types';

export class PayContributionDto implements PayContributionDtoShape {
  @IsString()
  circleId: string;

  @IsString()
  cycleId: string;

  @IsInt()
  @IsPositive()
  amount: number;

  @IsIn(['ORANGE_MONEY', 'MOOV_MONEY'])
  provider: 'ORANGE_MONEY' | 'MOOV_MONEY';

  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phoneNumber: string;
}
