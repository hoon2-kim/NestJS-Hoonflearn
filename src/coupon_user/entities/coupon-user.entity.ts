import { CouponEntity } from '@src/coupon/entities/coupon.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'coupons_users' })
export class CouponUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_coupon_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ nullable: true })
  used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @ManyToOne(() => CouponEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_coupon_id' })
  coupon: CouponEntity;
}
