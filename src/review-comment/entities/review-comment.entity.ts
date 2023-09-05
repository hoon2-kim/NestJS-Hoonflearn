import { Exclude } from 'class-transformer';
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
import { ReviewEntity } from '../../review/entities/review.entity';

@Entity({ name: 'reviews_comments' })
export class ReviewCommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contents: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_review_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @ManyToOne(() => ReviewEntity, (review) => review.reviewComments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'fk_review_id' })
  review: ReviewEntity;
}
