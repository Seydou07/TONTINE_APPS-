import { IsBoolean } from 'class-validator';

export class VoteDto {
  @IsBoolean()
  approved: boolean;
}
