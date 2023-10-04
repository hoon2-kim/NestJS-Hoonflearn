import { OrderCourseEntity } from '@src/order_course/entities/order-course.entity';
import { UserEntity } from '@src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EOrderStatus } from '@src/order/enums/order.enum';
import { Exclude } from 'class-transformer';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  orderName: string;

  @Column({ type: 'varchar' })
  imp_uid: string;

  @Column({ type: 'varchar' })
  merchant_uid: string;

  @Column({ type: 'int' })
  totalOrderPrice: number;

  @Column({ type: 'varchar' })
  paymentMethod: string;

  @Exclude()
  @Column({ type: 'uuid' })
  fk_user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'enum', enum: EOrderStatus })
  orderStatus: EOrderStatus;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @OneToMany(() => OrderCourseEntity, (orderCourse) => orderCourse.order)
  ordersCourses: OrderCourseEntity[];
}
