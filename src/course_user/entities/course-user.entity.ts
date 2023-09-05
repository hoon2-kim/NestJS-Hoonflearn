import { Exclude } from 'class-transformer';
import { CourseEntity } from 'src/course/entities/course.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ECouresUserType } from '../enums/course-user.enum';

@Entity({ name: 'courses_users' })
export class CourseUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO : 추후 컬럼 추가

  @Column({ enum: ECouresUserType })
  type: ECouresUserType;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_course_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.coursesUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @ManyToOne(() => CourseEntity, (course) => course.coursesUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;
}
