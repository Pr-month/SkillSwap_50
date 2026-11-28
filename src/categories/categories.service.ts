import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

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
        throw new NotFoundException('Родительская категория не найдена');
      }
    }

    const newCategory = this.categoryRepository.create({ name, parent });
    return this.categoryRepository.save(newCategory);
  }
}
