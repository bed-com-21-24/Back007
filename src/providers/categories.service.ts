import { Injectable, OnModuleInit, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { DEFAULT_CATEGORIES } from './categories.seed';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    const count = await this.categoryRepository.count();
    if (count === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await this.categoryRepository.save(
          this.categoryRepository.create({ ...cat, isApproved: true }),
        );
      }
    }
  }

  async findAll() {
    return this.categoryRepository.find({
      where: { isApproved: true },
      order: { name: 'ASC' },
    });
  }

  async create(name: string, skills: string[], isApproved = false) {
    const existing = await this.categoryRepository.findOne({ where: { name } });
    if (existing) throw new ConflictException('Category already exists');
    const category = this.categoryRepository.create({ name, skills, isApproved });
    return this.categoryRepository.save(category);
  }

  async addSkill(categoryId: number, skill: string) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    if (!category.skills.includes(skill)) {
      category.skills.push(skill);
      return this.categoryRepository.save(category);
    }
    return category;
  }
}