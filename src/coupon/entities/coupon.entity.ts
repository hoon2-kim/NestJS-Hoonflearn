import { CourseEntity } from '@src/course/entities/course.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ECouponType {
  INFINTY = 'INFINTY',
  LIMIT = 'LIMIT',
}

@Entity({ name: 'coupons' })
export class CouponEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  discountPrice: number;

  @Column({ enum: ECouponType, type: 'enum' })
  couponType: ECouponType;

  @Column({ nullable: true })
  totalQuantity: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  endAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => CourseEntity)
  course: CourseEntity;

  @ManyToOne(() => UserEntity)
  instructor: UserEntity;
}
