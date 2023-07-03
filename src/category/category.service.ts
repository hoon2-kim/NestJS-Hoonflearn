import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll() {
    const parents = await this.categoryRepository.find({
      where: {
        parent: IsNull(),
      },
    });

    for (const category of parents) {
      const subCategories = await this.categoryRepository.find({
        where: { parent: { id: category.id } },
      });
      category.children = subCategories;
    }

    return parent;
  }

  async findOne(categoryId: string, withRelations = true) {
    const query = {
      where: { id: categoryId, parent: IsNull() },
    };

    if (withRelations) {
      query['relations'] = {
        children: true,
      };
    }

    const category = await this.categoryRepository.findOne(query);

    if (!category) {
      throw new NotFoundException('부모 카테고리가 존재하지 않습니다.');
    }

    return category;
  }

  async createParent(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    await this.isCategoryName(name);

    return await this.categoryRepository.save({
      name,
    });
  }

  async createSub(categoryId: string, createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    await this.findOne(categoryId, false);

    await this.isCategoryName(name);

    return await this.categoryRepository.save({
      name,
      parent: { id: categoryId },
    });
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    const { name } = updateCategoryDto;

    const category = await this.findOne(categoryId, false);

    const duplicateName = await this.isCategoryName(name);

    if (duplicateName && category.name !== name) {
      throw new BadRequestException('해당 카테고리 이름이 이미 존재합니다.');
    }

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async delete(categoryId: string) {
    await this.findOne(categoryId, false);

    const result = await this.categoryRepository.delete({ id: categoryId });

    return result.affected ? true : false;
  }

  private async isCategoryName(name: string) {
    const isName = await this.categoryRepository.findOne({
      where: { name },
    });

    if (isName) {
      throw new BadRequestException('이미 존재하는 카테고리 이름입니다.');
    }

    return true;
  }
}
