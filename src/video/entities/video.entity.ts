import { Exclude } from 'class-transformer';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'videos' })
export class VideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  videoUrl: string;

  @Column({ type: 'int' })
  videoTime: number;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_lesson_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => LessonEntity, (lesson) => lesson.video, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_lesson_id' })
  lesson: LessonEntity;
}
