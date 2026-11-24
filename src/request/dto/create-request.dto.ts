import { IsInt, IsPositive } from 'class-validator';

export class CreateRequestDto {
  @IsInt()
  @IsPositive()
  receiverId!: number;

  @IsInt()
  @IsPositive()
  offeredSkillId!: number;

  @IsInt()
  @IsPositive()
  requestedSkillId!: number;
}
