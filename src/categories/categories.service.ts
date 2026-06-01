import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { parent: IsNull() },
      relations: { children: true },
    });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({ name: dto.name });

    if (dto.parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      category.parent = parent;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoriesRepository.remove(category);
  }
}
