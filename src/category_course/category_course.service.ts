import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryIdsDto } from '@src/course/dtos/create-course.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CategoryCourseEntity } from '@src/category_course/entities/category-course.entitiy';

@Injectable()
export class CategoryCourseService {
  constructor(
    @InjectRepository(CategoryCourseEntity)
    private readonly categoryCourseRepository: Repository<CategoryCourseEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async linkCourseToCategories(
    selectedCategoryIds: CategoryIdsDto[],
    courseId: string,
    manager?: EntityManager,
  ): Promise<CategoryCourseEntity[]> {
    const saveCategoryCourse = async (category: CategoryIdsDto) => {
      const isMain =
        category.subCategoryId === selectedCategoryIds[0].subCategoryId;
      const data = {
        fk_parent_category_id: category.parentCategoryId,
        fk_sub_category_id: category.subCategoryId,
        fk_course_id: courseId,
        isMain,
      };

      return manager
        ? await manager.save(CategoryCourseEntity, data)
        : await this.categoryCourseRepository.save(data);
    };

    return await Promise.all(selectedCategoryIds.map(saveCategoryCourse));
  }

  async updateCourseToCategories(
    selectedCategoryIds: CategoryIdsDto[],
    courseId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(CategoryCourseEntity, { fk_course_id: courseId });

      await this.linkCourseToCategories(selectedCategoryIds, courseId, manager);
    });
  }
}
