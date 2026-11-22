import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { SkillResponseDto } from './dto/skill-response.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto): Promise<{
    skills: SkillResponseDto[];
    total: number;
  }> {
    const { offset, limit, sortBy = 'id', order } = paginationQuery;

    const orderConfig: FindOptionsOrder<Skill> = {
      [sortBy]: order,
    };

    const [skills, total] = await this.skillsRepository.findAndCount({
      skip: offset,
      take: limit,
      order: orderConfig,
    });

    return {
      skills: skills.map((skill: Skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        skillImages: skill.skillImages,
        authorId: skill.authorId,
        likedByUserIds: skill.likedByUserIds,
      })),
      total,
    };
  }
}
