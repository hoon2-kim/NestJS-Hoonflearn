import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIdsDto } from 'src/course/dtos/request/create-course.dto';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from './dtos/request/create-category.dto';
import { UpdateCategoryDto } from './dtos/request/update-category.dto';
import { CategoryResponseDto } from './dtos/response/category.response.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(isRelation?: boolean): Promise<CategoryResponseDto[]> {
    const relations = isRelation
      ? {
          children: true,
        }
      : null;

    const categories = await this.categoryRepository.find({
      where: {
        parent: IsNull(),
      },
      relations,
      order: {
        name: 'asc',
        children: {
          name: 'asc',
        },
      },
    });

    return categories.map((c) => CategoryResponseDto.from(c));
  }

  async findOneById(
    categoryId: string,
    withRelations = true,
  ): Promise<CategoryResponseDto> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id = :categoryId', { categoryId });

    if (withRelations) {
      queryBuilder
        .leftJoinAndSelect('category.children', 'children')
        .orderBy('children.name', 'ASC');
    }

    const category = await queryBuilder.getOne();

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

    return CategoryResponseDto.from(category);
  }

  async createParent(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const { name } = createCategoryDto;

    const isName = await this.isCategoryName(name);

    if (isName) {
      throw new BadRequestException(
        `해당 카테고리 이름:${name} 이(가) 이미 존재합니다.`,
      );
    }

    return await this.categoryRepository.save({
      name,
    });
  }

  async createSub(
    categoryId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const { name } = createCategoryDto;

    await this.findOneById(categoryId, false);

    const isName = await this.isCategoryName(name);

    if (isName) {
      throw new BadRequestException(
        `해당 카테고리 이름:${name} 이(가) 이미 존재합니다.`,
      );
    }

    return await this.categoryRepository.save({
      name,
      parent: { id: categoryId },
    });
  }

  async update(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    const { name } = updateCategoryDto;

    const category = await this.findOneById(categoryId, false);

    const duplicateName = await this.isCategoryName(name);

    if (duplicateName && category.name !== name) {
      throw new BadRequestException(
        `해당 카테고리 이름:${name} 이(가) 이미 존재합니다.`,
      );
    }

    Object.assign(category, updateCategoryDto);

    await this.categoryRepository.save(category);
  }

  async delete(categoryId: string): Promise<boolean> {
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

  // async validateCategoryOptionalTransaction(
  //   selectedCategoryIds: CategoryIdsDto[],
  //   transactionManager?: EntityManager,
  // ): Promise<void> {
  //   let parent = null;
  //   let sub = null;

  //   await Promise.all(
  //     selectedCategoryIds.map(async (category) => {
  //       transactionManager
  //         ? (parent = await transactionManager.findOne(CategoryEntity, {
  //             where: { id: category.parentCategoryId },
  //           }))
  //         : (parent = await this.categoryRepository.findOne({
  //             where: { id: category.parentCategoryId },
  //           }));

  //       if (!parent) {
  //         throw new NotFoundException(
  //           `해당 카테고리ID:${category.parentCategoryId} 는 존재하지 않습니다.`,
  //         );
  //       }

  //       if (parent.fk_parent_category_id !== null) {
  //         throw new BadRequestException(
  //           `해당 메인 카테고리ID:${category.parentCategoryId} 는 메인 카테고리가 아닙니다.`,
  //         );
  //       }

  //       transactionManager
  //         ? (sub = await transactionManager.findOne(CategoryEntity, {
  //             where: { id: category.subCategoryId },
  //           }))
  //         : (sub = await this.categoryRepository.findOne({
  //             where: { id: category.subCategoryId },
  //           }));

  //       if (!sub) {
  //         throw new NotFoundException(
  //           `해당 카테고리ID:${category.subCategoryId} 는 존재하지 않습니다.`,
  //         );
  //       }

  //       if (sub.fk_parent_category_id === null) {
  //         throw new BadRequestException(
  //           `해당 카테고리ID:${category.subCategoryId} 는 메인 카테고리 입니다.`,
  //         );
  //       }
  //     }),
  //   );
  // }
  async validateCategoryOptionalTransaction(
    selectedCategoryIds: CategoryIdsDto[],
    transactionManager?: EntityManager,
  ) {
    return Promise.all(
      selectedCategoryIds.map(async (category) => {
        await this.validateParentCategory(
          category.parentCategoryId,
          transactionManager,
        );
        await this.validateSubCategory(
          category.subCategoryId,
          transactionManager,
        );
      }),
    );
  }

  private async validateParentCategory(
    categoryId: string,
    transactionManager?: EntityManager,
  ) {
    const parent = await this.findCategoryById(categoryId, transactionManager);

    if (!parent) {
      throw new NotFoundException(
        `해당 카테고리ID:${categoryId} 는 존재하지 않습니다.`,
      );
    }

    if (parent.fk_parent_category_id !== null) {
      throw new BadRequestException(
        `해당 메인 카테고리ID:${categoryId} 는 메인 카테고리가 아닙니다.`,
      );
    }
  }

  private async validateSubCategory(
    categoryId: string,
    transactionManager?: EntityManager,
  ) {
    const sub = await this.findCategoryById(categoryId, transactionManager);

    if (!sub) {
      throw new NotFoundException(
        `해당 카테고리ID:${categoryId} 는 존재하지 않습니다.`,
      );
    }

    if (sub.fk_parent_category_id === null) {
      throw new BadRequestException(
        `해당 카테고리ID:${categoryId} 는 메인 카테고리 입니다.`,
      );
    }
  }

  private async findCategoryById(
    categoryId: string,
    transactionManager?: EntityManager,
  ) {
    if (transactionManager) {
      return await transactionManager.findOne(CategoryEntity, {
        where: { id: categoryId },
      });
    } else {
      return await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
    }
  }
}
