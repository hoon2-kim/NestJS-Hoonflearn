import { OrderCourseEntity } from '@src/order_course/entities/order-course.entity';

export const mockOrderCourse = [
  {
    id: 'uuid',
    fk_order_id: 'uuid',
    fk_course_id: 'uuid',
    orderPrice: 50000,
    created_at: new Date('2023-10'),
  },
] as OrderCourseEntity[];
