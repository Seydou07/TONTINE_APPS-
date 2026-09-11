import { IsString, Length, Matches } from 'class-validator';
import type { VerifyOtpDto as VerifyOtpDtoShape } from '@venega/types';

export class VerifyOtpDto implements VerifyOtpDtoShape {
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phoneNumber: string;

  @IsString()
  @Length(4, 6)
  code: string;
}
