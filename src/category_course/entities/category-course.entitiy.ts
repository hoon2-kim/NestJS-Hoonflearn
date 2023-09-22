import { CategoryEntity } from '@src/category/entities/category.entity';
import { CourseEntity } from '@src/course/entities/course.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'categories_courses' })
export class CategoryCourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  isMain: boolean;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_course_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_parent_category_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_sub_category_id: string;

  @ManyToOne(() => CourseEntity, (course) => course.categoriesCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;

  @ManyToOne(
    () => CategoryEntity,
    (category) => category.parentCategoriesCourses,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'fk_parent_category_id' })
  parentCategory: CategoryEntity;

  @ManyToOne(
    () => CategoryEntity,
    (category) => category.subCategoriesCourses,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'fk_sub_category_id' })
  subCategory: CategoryEntity;
}
