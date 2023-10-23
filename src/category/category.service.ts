import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIdsDto } from '@src/course/dtos/request/create-course.dto';
import { EntityManager, FindOneOptions, IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from '@src/category/dtos/request/create-category.dto';
import { UpdateCategoryDto } from '@src/category/dtos/request/update-category.dto';
import { CategoryResponseDto } from '@src/category/dtos/response/category.response.dto';
import { CategoryEntity } from '@src/category/entities/category.entity';
import { ICategoryResponse } from './interfaces/category.interface';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
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
      // select: {
      //   id: true,
      //   name: true,
      //   children: {
      //     id: true,
      //     name: true,
      //     fk_parent_category_id: true,
      //   },
      // },
    });

    // return categories.map((category) => ({
    //   id: category.id,
    //   name: category.name,
    //   sub_category: category.children?.map((child) => ({
    //     id: child.id,
    //     fk_parent_category_id: child.fk_parent_category_id,
    //     name: child.name,
    //   })),
    // }));

    return categories.map((category) => CategoryResponseDto.from(category));
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

  async findOneWithSub(categoryId: string): Promise<CategoryResponseDto> {
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

    console.log(category);

    return CategoryResponseDto.from(category);
  }

  async createParent(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    const { name } = createCategoryDto;

    const isName = await this.findOneByOptions({ where: { name } });

    console.log(isName);

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
  ): Promise<{ message: string }> {
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

    await this.categoryRepository.save(category);

    return { message: '수정 성공' };
  }

  async delete(categoryId: string): Promise<boolean> {
    const category = await this.findOneByOptions({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `카테고리:${categoryId} 가 존재하지 않습니다.`,
      );
    }

    const result = await this.categoryRepository.delete({ id: categoryId });

    return result.affected ? true : false;
  }

  async validateCategoryOptionalTransaction(
    selectedCategoryIds: CategoryIdsDto[],
    manager?: EntityManager,
  ) {
    return Promise.all(
      selectedCategoryIds.map(async (category) => {
        await this.validateCategory(category.parentCategoryId, true, manager);
        await this.validateCategory(category.subCategoryId, false, manager);
      }),
    );
  }

  async validateCategory(
    categoryId: string,
    isMainCategory: boolean,
    manager?: EntityManager,
  ): Promise<void> {
    const category = await this.findOneByOptions(
      {
        where: { id: categoryId },
      },
      manager,
    );

    if (!category) {
      throw new NotFoundException(
        `해당 카테고리ID:${categoryId} 는 존재하지 않습니다.`,
      );
    }

    if (isMainCategory && category.fk_parent_category_id !== null) {
      throw new BadRequestException(
        `해당 메인 카테고리ID:${categoryId} 는 메인 카테고리가 아닙니다.`,
      );
    }

    if (!isMainCategory && category.fk_parent_category_id === null) {
      throw new BadRequestException(
        `해당 카테고리ID:${categoryId} 는 메인 카테고리 입니다.`,
      );
    }
  }
}
