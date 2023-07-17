import { Exclude } from 'class-transformer';
import { SectionEntity } from 'src/section/entities/section.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => SectionEntity, (section) => section.lessons)
  @JoinColumn({ name: 'fk_section_id' })
  section: SectionEntity;
}
