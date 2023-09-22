import { Exclude } from 'class-transformer';
import { CartCourseEntity } from '@src/cart_course/entities/cart-course.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'carts' })
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ name: 'fk_user_id' })
  fk_user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @OneToMany(() => CartCourseEntity, (cartCourse) => cartCourse.cart)
  cartsCourses: CartCourseEntity[];
}
