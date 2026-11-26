import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FindCitiesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
