import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIdsDto } from 'src/course/dtos/request/create-course.dto';
import { EntityManager, Repository } from 'typeorm';
import { CategoryCourseEntity } from './entities/category-course.entitiy';

/**
 * TODO : 동시성 테스트
 */
@Injectable()
export class CategoryCourseService {
  constructor(
    @InjectRepository(CategoryCourseEntity)
    private readonly categoryCourseRepository: Repository<CategoryCourseEntity>,
  ) {}

  async linkCourseToCategories(
    selectedCategoryIds: CategoryIdsDto[],
    courseId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const saveCategoryCourse = async (category: CategoryIdsDto) => {
      const isMain =
        category.subCategoryId === selectedCategoryIds[0].subCategoryId;
      const data = {
        fk_parent_category_id: category.parentCategoryId,
        fk_sub_category_id: category.subCategoryId,
        fk_course_id: courseId,
        isMain,
      };

      transactionManager
        ? await transactionManager.save(CategoryCourseEntity, data)
        : await this.categoryCourseRepository.save(data);
    };

    await Promise.all(selectedCategoryIds.map(saveCategoryCourse));
  }

  async updateCourseToCategories(
    selectedCategoryIds: CategoryIdsDto[],
    courseId: string,
  ): Promise<void> {
    await this.categoryCourseRepository.manager.transaction(async (manager) => {
      await manager.delete(CategoryCourseEntity, { fk_course_id: courseId });

      await this.linkCourseToCategories(selectedCategoryIds, courseId, manager);
    });
  }
}
