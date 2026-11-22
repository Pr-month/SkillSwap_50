import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
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

  async create(createSkillDto: CreateSkillDto): Promise<SkillResponseDto> {
    const skill = this.skillsRepository.create(createSkillDto);
    const savedSkill = await this.skillsRepository.save(skill);

    return {
      id: savedSkill.id,
      name: savedSkill.name,
      description: savedSkill.description,
      skillImages: savedSkill.skillImages,
      authorId: savedSkill.authorId,
      likedByUserIds: savedSkill.likedByUserIds,
    };
  }

  async findOne(id: number): Promise<SkillResponseDto> {
    const skill = await this.skillsRepository.findOne({ where: { id } });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      skillImages: skill.skillImages,
      authorId: skill.authorId,
      likedByUserIds: skill.likedByUserIds,
    };
  }

  async update(
    id: number,
    userId: number,
    updateSkillDto: UpdateSkillDto,
  ): Promise<SkillResponseDto> {
    const skill = await this.skillsRepository.findOne({ where: { id } });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    if (skill.authorId !== userId) {
      throw new ForbiddenException('Можно обновлять только свои навыки');
    }

    const updatedSkill = { ...skill, ...updateSkillDto };
    await this.skillsRepository.save(updatedSkill);

    return {
      id: updatedSkill.id,
      name: updatedSkill.name,
      description: updatedSkill.description,
      skillImages: updatedSkill.skillImages,
      authorId: updatedSkill.authorId,
      likedByUserIds: updatedSkill.likedByUserIds,
    };
  }
}
