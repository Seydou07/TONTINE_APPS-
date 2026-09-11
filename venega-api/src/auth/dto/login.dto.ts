import { IsString, Matches } from 'class-validator';
import type { LoginDto as LoginDtoShape } from '@venega/types';

export class LoginDto implements LoginDtoShape {
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phoneNumber: string;

  @IsString()
  password: string;
}
