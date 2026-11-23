export class SkillResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  skillImages!: string[] | null;
  authorId!: number;
  likedByUserIds!: string[] | null;
}

export class PaginatedSkillsResponseDto {
  skills!: SkillResponseDto[];
  total!: number;
  offset!: number;
  limit!: number;
}
