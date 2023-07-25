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

@Entity({ name: 'questionsComments' })
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @ManyToOne(() => QuestionEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fk_question_id' })
  question: QuestionEntity;
}
