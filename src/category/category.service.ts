import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIdsDto } from 'src/course/dto/create-course.dto';
import { In, IsNull, QueryRunner, Repository } from 'typeorm';
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
        order: { name: 'ASC' },
      });
      category.children = subCategories;
    }

    return parents;
  }

  async findOneById(categoryId: string, withRelations = true) {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id = :categoryId', { categoryId });

    if (withRelations) {
      const hasParent = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.id = :categoryId', { categoryId })
        .andWhere('category.parent IS NOT NULL')
        .getOne();

      if (!hasParent)
        queryBuilder.leftJoinAndSelect('category.children', 'children');
    }

    const category = await queryBuilder.getOne();

    if (!category) {
      throw new NotFoundException('카테고리가 존재하지 않습니다.');
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

    await this.findOneById(categoryId, false);

    await this.isCategoryName(name);

    return await this.categoryRepository.save({
      name,
      parent: { id: categoryId },
    });
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    const { name } = updateCategoryDto;

    const category = await this.findOneById(categoryId, false);

    const duplicateName = await this.isCategoryName(name);

    if (duplicateName && category.name !== name) {
      throw new BadRequestException('해당 카테고리 이름이 이미 존재합니다.');
    }

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async delete(categoryId: string) {
    await this.findOneById(categoryId, false);

    const result = await this.categoryRepository.delete({ id: categoryId });

    return result.affected ? true : false;
  }

  private async isCategoryName(name: string) {
    const isName = await this.categoryRepository.findOne({
      where: { name },
    });

    return isName;
  }

  async validateCategoryWithTransaction(
    selectedCategoryIds: CategoryIdsDto[],
    queryRunner: QueryRunner,
  ): Promise<void> {
    await Promise.all(
      selectedCategoryIds.map(async (category) => {
        const parent = await queryRunner.manager.findOne(CategoryEntity, {
          where: { id: category.parentCategoryId },
        });

        if (!parent) {
          throw new NotFoundException(
            '해당 부모 카테고리가 존재하지 않습니다.',
          );
        }

        if (parent.fk_parent_category_id !== null) {
          throw new BadRequestException(
            '해당 카테고리ID는 부모 카테고리가 아닙니다.',
          );
        }

        const sub = await queryRunner.manager.findOne(CategoryEntity, {
          where: { id: category.subCategoryId },
        });

        if (!sub) {
          throw new NotFoundException(
            '해당 서브 카테고리가 존재하지 않습니다.',
          );
        }

        if (sub.fk_parent_category_id === null) {
          throw new BadRequestException(
            '해당 카테고리ID는 부모 카테고리 입니다.',
          );
        }
      }),
    );
  }

  async validateCategory(selectedCategoryIds: CategoryIdsDto[]): Promise<void> {
    await Promise.all(
      selectedCategoryIds.map(async (category) => {
        const parent = await this.categoryRepository.findOne({
          where: { id: category.parentCategoryId },
        });

        if (!parent) {
          throw new NotFoundException(
            '해당 부모 카테고리가 존재하지 않습니다.',
          );
        }

        if (parent.fk_parent_category_id !== null) {
          throw new BadRequestException(
            '해당 카테고리ID는 부모 카테고리가 아닙니다.',
          );
        }

        const sub = await this.categoryRepository.findOne({
          where: { id: category.subCategoryId },
        });

        if (!sub) {
          throw new NotFoundException(
            '해당 서브 카테고리가 존재하지 않습니다.',
          );
        }

        if (sub.fk_parent_category_id === null) {
          throw new BadRequestException(
            '해당 카테고리ID는 부모 카테고리 입니다.',
          );
        }
      }),
    );
  }
}
