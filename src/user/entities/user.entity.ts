import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { InstructorProfileEntity } from 'src/instructor/entities/instructor-profile.entity';
import { CourseEntity } from 'src/course/entities/course.entity';
import { CourseWishEntity } from 'src/course_wish/entities/course-wish.entity';
import { ReviewEntity } from 'src/review/entities/review.entity';
import { CourseUserEntity } from 'src/course_user/entities/course-user.entity';
import { ERoleType } from '../enums/user.enum';
import { QuestionEntity } from 'src/question/entities/question.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  nickname: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  profileAvatar: string;

  @Column({ type: 'enum', enum: ERoleType, default: ERoleType.User })
  role: ERoleType;

  @Exclude()
  @Column({ type: 'varchar', default: null })
  hashedRt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;

  @OneToOne(
    () => InstructorProfileEntity,
    (instructorProfile) => instructorProfile.user,
  )
  instructorProfile: InstructorProfileEntity;

  @OneToMany(() => CourseEntity, (course) => course.instructor)
  madeCourses: CourseEntity[];

  @OneToMany(() => CourseWishEntity, (courseWish) => courseWish.user)
  coursesWishs: CourseWishEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews: ReviewEntity[];

  @OneToMany(() => CourseUserEntity, (courseUser) => courseUser.user)
  coursesUsers: CourseUserEntity[];

  @OneToMany(() => QuestionEntity, (question) => question.user)
  questions: QuestionEntity[];
}
