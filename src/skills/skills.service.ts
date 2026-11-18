import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  create(createSkillDto: CreateSkillDto) {
    return 'This action adds a new skill';
  }

  findAll() {
    return `This action returns all skills`;
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  update(id: number, updateSkillDto: UpdateSkillDto) {
    return `This action updates a #${id} skill`;
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
