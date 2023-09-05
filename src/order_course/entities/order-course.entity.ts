import { Exclude } from 'class-transformer';
import { CourseEntity } from 'src/course/entities/course.entity';
import { OrderEntity } from 'src/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'orders_courses' })
export class OrderCourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  orderPrice: number;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_order_id: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_course_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => OrderEntity, (order) => order.ordersCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fk_order_id' })
  order: OrderEntity;

  // 후에 수정
  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fk_course_id' })
  course: CourseEntity;
}
