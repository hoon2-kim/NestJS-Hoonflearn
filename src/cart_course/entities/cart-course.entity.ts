import { CartEntity } from '@src/cart/entities/cart.entity';
import { CourseEntity } from '@src/course/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'carts_courses' })
export class CartCourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fk_cart_id: string;

  @Column({ type: 'uuid' })
  fk_course_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => CartEntity, (cart) => cart.cartsCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_cart_id' })
  cart: CartEntity;

  @ManyToOne(() => CourseEntity, (course) => course.cartsCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;
}
