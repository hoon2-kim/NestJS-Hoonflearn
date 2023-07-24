import {
  Column,
  CreateDateColumn,
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

export enum RoleType {
  User = 'User',
  Instructor = 'Instructor',
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  nickname: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  profileAvatar: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.User })
  role: RoleType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Exclude()
  @Column({ type: 'varchar', default: null })
  hashedRt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

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
}
