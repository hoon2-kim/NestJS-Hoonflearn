import { Exclude } from 'class-transformer';
import { CourseEntity } from 'src/course/entities/course.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'courses_wishs' })
// @Index(['fk_course_id', 'fk_user_id'], { unique: true })
export class CourseWishEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_course_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => CourseEntity, (course) => course.coursesWishs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;

  @ManyToOne(() => UserEntity, (user) => user.coursesWishs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;
}
