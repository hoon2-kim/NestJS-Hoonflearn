import { Exclude } from 'class-transformer';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CourseLevelType {
  Introduction = '입문',
  Beginner = '초급',
  IntermediateLevelOrHigher = '중급이상',
}

@Entity({ name: 'courses' })
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  // 이런걸 배울 수 있어요
  @Column({ type: 'varchar', array: true })
  learnable: string[];

  // 이런 분들에게 추천해요
  @Column({ type: 'varchar', array: true })
  recommendedFor: string[];

  // 선수 지식
  @Column({ type: 'varchar', array: true, nullable: true })
  prerequisite?: string[];

  @Column({ type: 'enum', enum: CourseLevelType })
  level: CourseLevelType;

  // 두줄요약
  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar', nullable: true })
  coverImage?: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 0 })
  dibsCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fk_instructor_id' })
  instructor: UserEntity;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_instructor_id: string;

  //   @OneToMany(() => CategoryCourse, (categoryCourse) => categoryCourse.course)
  //   categoriesCourses: CategoryCourse[];

  //   @OneToMany(() => CoursesReview, (review) => review.course)
  //   reviews: CoursesReview[];

  //   @OneToMany(() => CourseUser, (courseUser) => courseUser.course)
  //   course_user: CourseUser[];
}
