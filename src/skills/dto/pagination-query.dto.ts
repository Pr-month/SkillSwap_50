import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 0))
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsEnum(SortOrder)
  @Transform(({ value }): SortOrder =>
    value && typeof value === 'string'
      ? (value.toUpperCase() as SortOrder)
      : SortOrder.ASC,
  )
  order?: SortOrder = SortOrder.ASC;
}
