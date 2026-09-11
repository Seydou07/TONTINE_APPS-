import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DecideJoinRequestDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
