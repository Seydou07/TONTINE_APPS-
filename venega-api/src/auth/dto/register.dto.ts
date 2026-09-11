import { IsString, Matches, MinLength } from 'class-validator';
import type { RegisterDto as RegisterDtoShape } from '@venega/types';

export class RegisterDto implements RegisterDtoShape {
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;
}
