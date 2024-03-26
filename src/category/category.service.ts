import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIdsDto } from '@src/course/dtos/create-course.dto';
import {
  EntityManager,
  FindOneOptions,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { CreateCategoryDto } from '@src/category/dtos/create-category.dto';
import { CategoryEntity } from '@src/category/entities/category.entity';
import { UpdateCategoryDto } from '@src/category/dtos/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.categoryRepository.find({
      where: {
        parent: IsNull(),
      },
      relations: {
        children: true,
      },
      order: {
        name: 'asc',
        children: {
          name: 'asc',
        },
      },
    });

    return categories;
  }

  async findOneByOptions(
    options: FindOneOptions<CategoryEntity>,
    manager?: EntityManager,
  ): Promise<CategoryEntity | null> {
    let category: CategoryEntity | null;

    manager
      ? (category = await manager.findOne(CategoryEntity, options))
      : (category = await this.categoryRepository.findOne(options));

    return category;
  }

  async findOneWithSub(categoryId: string): Promise<CategoryEntity> {
    const category = await this.findOneByOptions({
      where: {
        id: categoryId,
      },
      relations: {
        children: true,
      },
      order: {
        children: {
          name: 'ASC',
        },
      },
    });

    if (!category) {
      throw new NotFoundException(
        `카테고리:${categoryId} 가 존재하지 않습니다.`,
      );
    }

    if (category.fk_parent_category_id !== null) {
      throw new BadRequestException(
        `해당 ID:${categoryId}는 메인 카테고리ID가 아닙니다.`,
      );
    }

    return category;
  }

  async createParent(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const { name } = createCategoryDto;

    const isName = await this.findOneByOptions({ where: { name } });

    if (isName) {
      throw new BadRequestException(
        `해당 카테고리 이름:${name} 이(가) 이미 존재합니다.`,
      );
    }

    const result = await this.categoryRepository.save({
      name,
    });

    return result;
  }

  async createSub(
    categoryId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const { name } = createCategoryDto;

    const category = await this.findOneByOptions({ where: { id: categoryId } });

    if (!category) {
      throw new NotFoundException(
        `카테고리:${categoryId} 가 존재하지 않습니다.`,
      );
    }

    const isName = await this.findOneByOptions({ where: { name } });

    if (isName) {
      throw new BadRequestException(
        `해당 카테고리 이름:${name} 이(가) 이미 존재합니다.`,
      );
    }

    const result = await this.categoryRepository.save({
      name,
      parent: { id: categoryId },
    });

    delete result.parent;

    return result;
  }

  async update(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const { name } = updateCategoryDto;

    const category = await this.findOneByOptions({
      where: { id: categoryId },
    });

    if (category) {
      const duplicateName = await this.findOneByOptions({
        where: { name },
      });

      if (duplicateName && category.name !== name) {
        throw new BadRequestException(
          `해당 카테고리 이름:${name} 이(가) 이미 존재합니다.`,
        );
      }
    }

    if (!category) {
      throw new NotFoundException(
        `카테고리:${categoryId} 가 존재하지 않습니다.`,
      );
    }

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async delete(categoryId: string): Promise<void> {
    const category = await this.findOneByOptions({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `카테고리:${categoryId} 가 존재하지 않습니다.`,
      );
    }

    await this.categoryRepository.delete({ id: categoryId });
  }

  async validateCategory(
    selectedCategoryIds: CategoryIdsDto[],
    manager?: EntityManager,
  ): Promise<void> {
    const parentCategoryIds = selectedCategoryIds.map(
      (c) => c.parentCategoryId,
    );
    const subCategoryIds = selectedCategoryIds.map((c) => c.subCategoryId);

    const parentCategory = await this.findOneByOptions(
      {
        where: { id: In(parentCategoryIds) },
      },
      manager,
    );

    if (!parentCategory) {
      throw new BadRequestException('해당 메인 카테고리가 존재하지 않습니다.');
    }

    if (parentCategory.fk_parent_category_id !== null) {
      throw new BadRequestException(
        '해당 카테고리는 메인 카테고리가 아닙니다.',
      );
    }

    const subCategory = await this.findOneByOptions(
      {
        where: {
          id: In(subCategoryIds),
          fk_parent_category_id: Not(IsNull()),
        },
      },
      manager,
    );

    if (!subCategory) {
      throw new BadRequestException(
        '해당 서브 카테고리가 존재하지 않거나 서브 카테고리가 아닙니다.',
      );
    }

    if (subCategory.fk_parent_category_id !== parentCategory.id) {
      throw new BadRequestException(
        '서브 카테고리와 메인 카테고리가 일치하지 않습니다.',
      );
    }
  }
}
