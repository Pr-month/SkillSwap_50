import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

const SORT_FIELDS = ['id', 'name', 'title', 'description'] as const;
type SortField = (typeof SORT_FIELDS)[number];

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsIn(SORT_FIELDS)
  sortBy?: SortField = 'id';

  @IsOptional()
  @IsEnum(SortOrder)
  @Transform(({ value }): SortOrder =>
    value && typeof value === 'string'
      ? (value.toUpperCase() as SortOrder)
      : SortOrder.ASC,
  )
  order?: SortOrder = SortOrder.ASC;
}
