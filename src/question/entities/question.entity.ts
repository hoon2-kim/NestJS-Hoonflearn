import { Exclude } from 'class-transformer';
import { CourseEntity } from '@src/course/entities/course.entity';
import { QuestionCommentEntity } from '@src/question/question-comment/entities/question-comment.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EQuestionStatus } from '@src/question/enums/question.enum';

@Entity({ name: 'questions' })
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  contents: string;

  @Column({
    type: 'enum',
    enum: EQuestionStatus,
    default: EQuestionStatus.UnResolved,
  })
  questionStatus: EQuestionStatus;

  @Column({ type: 'int', default: 0 })
  voteCount: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  fk_course_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => CourseEntity, (course) => course.questions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;

  @ManyToOne(() => UserEntity, (user) => user.questions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @OneToMany(() => QuestionCommentEntity, (comment) => comment.question)
  questionComments: QuestionCommentEntity[];
}
