import { Exclude } from 'class-transformer';
import { QuestionEntity } from '@src/question/entities/question.entity';
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

@Entity({ name: 'questions_comments' })
export class QuestionCommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contents: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_question_id: string;

  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  fk_question_comment_parentId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @ManyToOne(() => QuestionEntity, (question) => question.questionComments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'fk_question_id' })
  question: QuestionEntity;

  @ManyToOne(
    () => QuestionCommentEntity,
    (questionComment) => questionComment.reComments,
    { onDelete: 'SET NULL', nullable: true },
  )
  @JoinColumn({ name: 'fk_question_comment_parentId' })
  parentComment: QuestionCommentEntity;

  @OneToMany(
    () => QuestionCommentEntity,
    (questionComment) => questionComment.parentComment,
  )
  reComments: QuestionCommentEntity[];
}
