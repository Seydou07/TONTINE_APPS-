import { IsBoolean, IsString, Matches, MinLength } from 'class-validator';

export class RequestJoinDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phoneNumber: string;

  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro Mobile Money invalide' })
  depositNumber: string;

  @IsString()
  cnibFrontUrl: string;

  @IsString()
  cnibBackUrl: string;

  @IsBoolean()
  conditionsAccepted: boolean;
}
