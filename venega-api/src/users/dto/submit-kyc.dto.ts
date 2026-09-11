import { IsIn, IsString } from 'class-validator';

export class SubmitKycDto {
  @IsString()
  kycDocumentUrl: string;

  @IsString()
  kycSelfieUrl: string;

  @IsIn(['CNIB', 'PASSPORT'])
  kycDocumentType: 'CNIB' | 'PASSPORT';
}
