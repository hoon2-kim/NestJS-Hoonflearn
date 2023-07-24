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

@Entity({ name: 'questions' })
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  contents: string;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_course_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;
}
