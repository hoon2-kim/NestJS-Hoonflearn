import { Exclude } from 'class-transformer';
import { QuestionEntity } from 'src/question/entities/question.entity';
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
import { EQuestionVoteType } from '../enums/question-vote.enum';

@Entity({ name: 'question_vote' })
export class QuestionVoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_question_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @Column({ type: 'enum', enum: EQuestionVoteType })
  voteType: EQuestionVoteType;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_question_id' })
  question: QuestionEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;
}
