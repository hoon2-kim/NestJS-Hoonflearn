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
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reviews' })
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contents: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_course_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @ManyToOne(() => CourseEntity, (course) => course.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;
}
