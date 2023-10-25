import { Exclude } from 'class-transformer';
import { SectionEntity } from '@src/section/entities/section.entity';
import { VideoEntity } from '@src/video/entities/video.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'lessons' })
export class LessonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ default: false })
  isFreePublic: boolean;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_section_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => SectionEntity, (section) => section.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_section_id' })
  section: SectionEntity;

  @OneToOne(() => VideoEntity, (video) => video.lesson, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  video?: VideoEntity;
}
