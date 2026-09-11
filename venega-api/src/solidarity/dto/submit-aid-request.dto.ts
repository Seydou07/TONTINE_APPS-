import { IsEnum, IsInt, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { EventType } from '@venega/types';
import type { SubmitAidRequestDto as SubmitAidRequestDtoShape } from '@venega/types';

export class SubmitAidRequestDto implements SubmitAidRequestDtoShape {
  @IsString()
  circleId: string;

  @IsString()
  cycleId: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsString()
  @MinLength(3)
  reason: string;

  @IsInt()
  @IsPositive()
  amountRequested: number;

  @IsOptional()
  @IsString()
  proofUrl?: string;
}
