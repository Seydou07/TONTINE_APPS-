import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { CircleType, Frequency, ContributionMode } from '@venega/types';
import type { CreateCircleDto as CreateCircleDtoShape } from '@venega/types';

export class CreateCircleDto implements CreateCircleDtoShape {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEnum(CircleType)
  type: CircleType;

  @IsOptional()
  @IsInt()
  @Min(0)
  tontineAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  solidarityAmount?: number;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsOptional()
  @IsEnum(ContributionMode)
  contributionMode?: ContributionMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  beneficiariesPerTurn?: number;
}
