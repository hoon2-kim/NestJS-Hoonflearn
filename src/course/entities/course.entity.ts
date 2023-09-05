import { Exclude } from 'class-transformer';
import { CartCourseEntity } from 'src/cart_course/entities/cart-course.entity';
import { CategoryCourseEntity } from 'src/category_course/entities/category-course.entitiy';
import { CourseUserEntity } from 'src/course_user/entities/course-user.entity';
import { CourseWishEntity } from 'src/course_wish/entities/course-wish.entity';
import { ReviewEntity } from 'src/review/entities/review.entity';
import { SectionEntity } from 'src/section/entities/section.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ECourseLevelType } from '../enums/course.enum';

@Entity({ name: 'courses' })
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', array: true, comment: '이런걸 배울 수 있어요' })
  learnable: string[];

  @Column({ type: 'varchar', array: true, comment: '이런 분들에게 추천해요' })
  recommendedFor: string[];

  @Column({
    type: 'varchar',
    array: true,
    nullable: true,
    comment: '선수 지식',
  })
  prerequisite?: string[];

  @Column({ type: 'enum', enum: ECourseLevelType, comment: '강의 수준' })
  level: ECourseLevelType;

  @Column({ type: 'text', comment: '두줄요약' })
  summary: string;

  @Column({ type: 'text', comment: '상세소개' })
  description: string;

  @Column({ type: 'int' })
  price: number;

  // @Column({ type: 'int', nullable: true })
  // discountCoursePrice?: number;

  @Column({ type: 'varchar', nullable: true })
  coverImage?: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 0 })
  wishCount: number;

  @Column({ type: 'int', default: 0 })
  totalVideosTime: number;

  @Column({ type: 'int', default: 0 })
  totalLessonCount: number;

  @Column({ type: 'int', default: 0 })
  students: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.madeCourses)
  @JoinColumn({ name: 'fk_instructor_id' })
  instructor: UserEntity;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_instructor_id: string;

  @OneToMany(
    () => CategoryCourseEntity,
    (categoryCourse) => categoryCourse.course,
  )
  categoriesCourses: CategoryCourseEntity[];

  @OneToMany(() => CourseWishEntity, (courseWish) => courseWish.course)
  coursesWishs: CourseWishEntity[];

  @OneToMany(() => SectionEntity, (section) => section.course)
  sections: SectionEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.course)
  reviews: ReviewEntity[];

  @OneToMany(() => CourseUserEntity, (courseUser) => courseUser.course)
  coursesUsers: CourseUserEntity[];

  @OneToMany(() => CartCourseEntity, (cartCourse) => cartCourse.course)
  cartsCourses: CartCourseEntity[];
}
