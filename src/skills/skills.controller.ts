import { Controller, Get, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedSkillsResponseDto } from './dto/skill-response.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedSkillsResponseDto> {
    const { skills, total } = await this.skillsService.findAll(paginationQuery);

    return {
      skills,
      total,
      offset: paginationQuery.offset ?? 0,
      limit: paginationQuery.limit ?? 10,
    };
  }
}
