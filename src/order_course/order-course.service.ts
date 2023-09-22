import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from '@src/course/entities/course.entity';
import { EntityManager, Repository } from 'typeorm';
import { OrderCourseEntity } from '@src/order_course/entities/order-course.entity';

@Injectable()
export class OrderCourseService {
  constructor(
    @InjectRepository(OrderCourseEntity)
    private readonly orderCourseRepository: Repository<OrderCourseEntity>,
  ) {}

  async saveOrderCourseRepoWithTransaction(
    courses: CourseEntity[],
    orderId: string,
    entityManager: EntityManager,
  ): Promise<OrderCourseEntity[]> {
    return await Promise.all(
      courses.map(async (course) => {
        return await entityManager.save(OrderCourseEntity, {
          orderPrice: course.price,
          fk_order_id: orderId,
          fk_course_id: course.id,
        });
      }),
    );
  }
}
