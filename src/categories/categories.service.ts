import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createCategoryDto;

    let parent: Category | null = null;

    if (parentId !== undefined) {
      parent = await this.categoryRepository.findOneBy({ id: parentId });
      if (!parent) {
        throw new NotFoundException(
          `Родительская категория с id ${parentId} не найдена`,
        );
      }
    }

    const newCategory = this.categoryRepository.create({ name, parent });
    return this.categoryRepository.save(newCategory);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Категория с id ${id} не найдена`);
    }

    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<{ id: number }> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { children: true, skills: true },
    });
    if (!category) {
      throw new NotFoundException(`Категория с id ${id} не найдена`);
    }
    if (category.children.length > 0) {
      throw new ConflictException('Нельзя удалить категорию с подкатегориями');
    }
    if (category.skills.length > 0) {
      throw new ConflictException('Нельзя удалить категорию с навыками');
    }
    await this.categoryRepository.remove(category);
    return { id };
  }
}
