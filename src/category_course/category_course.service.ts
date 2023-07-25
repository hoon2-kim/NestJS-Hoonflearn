import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIdsDto } from 'src/course/dtos/create-course.dto';
import { EntityManager, Repository } from 'typeorm';
import { CategoryCourseEntity } from './entities/category-course.entitiy';

@Injectable()
export class CategoryCourseService {
  constructor(
    @InjectRepository(CategoryCourseEntity)
    private readonly categoryCourseRepository: Repository<CategoryCourseEntity>,
  ) {}

  async saveCategoryCourseRepo(
    selectedCategoryIds: CategoryIdsDto[],
    courseId: string,
    transactionManager?: EntityManager,
  ) {
    if (transactionManager) {
      await Promise.all(
        selectedCategoryIds.map(async (category) => {
          await transactionManager.save(CategoryCourseEntity, {
            fk_parent_category_id: category.parentCategoryId,
            fk_sub_category_id: category.subCategoryId,
            fk_course_id: courseId,
            isMain:
              category.subCategoryId === selectedCategoryIds[0].subCategoryId,
          });
        }),
      );
    } else {
      await Promise.all(
        selectedCategoryIds.map(async (category) => {
          await this.categoryCourseRepository.save({
            fk_parent_category_id: category.parentCategoryId,
            fk_sub_category_id: category.subCategoryId,
            fk_course_id: courseId,
            isMain:
              category.subCategoryId === selectedCategoryIds[0].subCategoryId,
          });
        }),
      );
    }
  }

  // async saveWithTransaction(
  //   selectedCategoryIds: CategoryIdsDto[],
  //   courseId: string,
  //   queryRunner: QueryRunner,
  // ) {
  //   await Promise.all(
  //     selectedCategoryIds.map(async (category) => {
  //       await queryRunner.manager.save(CategoryCourseEntity, {
  //         fk_parent_category_id: category.parentCategoryId,
  //         fk_sub_category_id: category.subCategoryId,
  //         fk_course_id: courseId,
  //         isMain:
  //           category.subCategoryId === selectedCategoryIds[0].subCategoryId,
  //       });
  //     }),
  //   );
  // }

  // async saveWithoutTransaction(
  //   selectedCategoryIds: CategoryIdsDto[],
  //   courseId: string,
  // ) {
  //   await Promise.all(
  //     selectedCategoryIds.map(async (category) => {
  //       await this.categoryCourseRepository.save({
  //         fk_parent_category_id: category.parentCategoryId,
  //         fk_sub_category_id: category.subCategoryId,
  //         fk_course_id: courseId,
  //         isMain:
  //           category.subCategoryId === selectedCategoryIds[0].subCategoryId,
  //       });
  //     }),
  //   );
  // }
}
