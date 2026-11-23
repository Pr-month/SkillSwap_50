import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { PaginationQueryDto, SortOrder } from './dto/pagination-query.dto';
import { SkillResponseDto } from './dto/skill-response.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(
    { name, description, skillImages, categoryId }: CreateSkillDto,
    ownerId: number,
  ): Promise<SkillResponseDto> {
    const skill = this.skillsRepository.create({
      title: name,
      description,
      images: skillImages ?? [],
      category: { id: categoryId },
      owner: { id: ownerId },
      favoritedByUsers: [],
    });

    return this.toResponse(await this.skillsRepository.save(skill));
  }

  async findAll(paginationQuery: PaginationQueryDto): Promise<{
    skills: SkillResponseDto[];
    total: number;
  }> {
    const {
      offset = 0,
      limit = 10,
      sortBy = 'id',
      order = SortOrder.ASC,
    } = paginationQuery;
    const sortColumn = sortBy === 'name' ? 'title' : sortBy;
    const orderConfig: FindOptionsOrder<Skill> = {
      [sortColumn]: order,
      id: sortColumn === 'id' ? order : SortOrder.ASC,
    };
    const [skills, total] = await this.skillsRepository.findAndCount({
      skip: offset,
      take: limit,
      order: orderConfig,
      relations: { owner: true, favoritedByUsers: true },
      relationLoadStrategy: 'query',
    });

    return {
      skills: skills.map((skill) => this.toResponse(skill)),
      total,
    };
  }

  private toResponse(skill: Skill): SkillResponseDto {
    return {
      id: skill.id,
      name: skill.title,
      description: skill.description,
      skillImages: skill.images,
      authorId: skill.owner.id,
      likedByUserIds: skill.favoritedByUsers.map(({ id }) => String(id)),
    };
  }

  async findOne(id: number): Promise<SkillResponseDto> {
    return this.toResponse(await this.findSkill(id));
  }

  async update(
    id: number,
    ownerId: number,
    { name, description, skillImages }: UpdateSkillDto,
  ): Promise<SkillResponseDto> {
    const skill = await this.findSkill(id);
    if (skill.owner.id !== ownerId) {
      throw new ForbiddenException('Можно обновлять только свои навыки');
    }

    const changes = {
      ...(name !== undefined && { title: name }),
      ...(description !== undefined && { description }),
      ...(skillImages !== undefined && { images: skillImages ?? [] }),
    };
    if (Object.keys(changes).length === 0) {
      return this.toResponse(skill);
    }

    await this.skillsRepository.update({ id }, changes);
    return this.findOne(id);
  }

  private async findSkill(id: number): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true, favoritedByUsers: true },
    });
    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }
    return skill;
  }

  async remove(id: number, userId: number): Promise<{ id: number }> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own skills');
    }

    await this.deleteUploadedImages(skill.images);
    const deleted = await this.skillsRepository.remove(skill);

    return { id: deleted.id };
  }

  private async deleteUploadedImages(images: string[]): Promise<void> {
    if (!images || images.length === 0) {
      return;
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');

    await Promise.all(
      images.map(async (image) => {
        const filename = basename(image);
        if (!filename) {
          return;
        }
        try {
          await unlink(join(uploadsDir, filename));
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;
          if (code !== 'ENOENT') {
            this.logger.warn(
              `Failed to delete image file ${filename}: ${String(error)}`,
            );
          }
        }
      }),
    );
  }
}
