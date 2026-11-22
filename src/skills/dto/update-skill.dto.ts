import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillImages?: string[];
}
