import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/cart/cart.service';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { PageDto } from 'src/common/dtos/page.dto';
import { CourseEntity } from 'src/course/entities/course.entity';
import { CourseUserService } from 'src/course_user/course-user.service';
import { OrderCourseService } from 'src/order_course/order-course.service';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dtos/request/create-order.dto';
import { OrderListQueryDto } from './dtos/query/order-list.query.dto';
import { OrderEntity } from './entities/order.entity';
import { IamportService } from './iamport.service';
import { EOrderAction, EOrderStatus } from './enums/order.enum';
import { ICoursesTotalPrice } from 'src/course/interfaces/course.interface';
import {
  OrderDetailResponseDto,
  OrdersResponseDto,
} from './dtos/response/order.response.dto';
import { CourseService } from 'src/course/course.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    private readonly dataSource: DataSource,
    private readonly iamportService: IamportService,
    private readonly orderCourseService: OrderCourseService,
    private readonly cartService: CartService,
    private readonly courseUserService: CourseUserService,
    private readonly courseService: CourseService,
  ) {}

  async findOrders(
    orderListQueryDto: OrderListQueryDto,
    userId: string,
  ): Promise<PageDto<OrdersResponseDto>> {
    const { take, skip } = orderListQueryDto;

    const [orders, count] = await this.orderRepository.findAndCount({
      where: { fk_user_id: userId },
      order: { created_at: 'DESC' },
      take,
      skip,
    });

    const pageMeta = new PageMetaDto({
      pageOptionDto: orderListQueryDto,
      itemCount: count,
    });

    return new PageDto(
      orders.map((o) => OrdersResponseDto.from(o)),
      pageMeta,
    );
  }

  async findOrderDetail(
    orderId: string,
    userId: string,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.ordersCourses', 'orderCourse')
      .leftJoinAndSelect('orderCourse.course', 'course')
      .where('order.id = :orderId', { orderId })
      .andWhere('order.fk_user_id = :userId', { userId })
      .getOne();

    if (!order) {
      throw new NotFoundException('해당 주문기록이 존재하지 않습니다.');
    }

    return OrderDetailResponseDto.from(order);
  }

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<OrderEntity> {
    const { imp_uid, price, courseIds } = createOrderDto;

    const getIamportPaymentData = await this.iamportService.getPaymentData(
      imp_uid,
      price,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const checkOrder = await queryRunner.manager.findOne(OrderEntity, {
        where: {
          imp_uid,
          fk_user_id: userId,
        },
      });

      if (checkOrder) {
        throw new ConflictException('이미 결제되었습니다.');
      }

      const coursesQuery = queryRunner.manager
        .getRepository(CourseEntity)
        .createQueryBuilder('course')
        .where('course.id IN (:...ids)', { ids: courseIds });

      const validateCourses = await coursesQuery.getMany();

      if (!(validateCourses.length === courseIds.length)) {
        throw new BadRequestException('등록되지 않은 일부의 강의가 있습니다.');
      }

      const coursesPrice: ICoursesTotalPrice = await coursesQuery
        .select('SUM(course.price) as total_price')
        .getRawOne();

      if (price !== Number(coursesPrice.total_price)) {
        throw new BadRequestException('가격이 일치하지 않습니다.');
      }

      const orderName = await this.generateOrderName(
        validateCourses[0].title,
        validateCourses.length,
      );

      // 주문정보 저장
      const order = queryRunner.manager.create(OrderEntity, {
        imp_uid,
        orderName,
        merchant_uid: getIamportPaymentData?.merchant_uid,
        totalOrderPrice: getIamportPaymentData?.amount,
        paymentMethod: getIamportPaymentData?.pay_method,
        orderStatus: EOrderStatus.COMPLETED,
        fk_user_id: userId,
      });

      const result = await queryRunner.manager.save(OrderEntity, order);

      // 중간테이블 저장(주문-강의)
      await this.orderCourseService.saveOrderCourseRepoWithTransaction(
        validateCourses,
        result.id,
        queryRunner.manager,
      );

      // 중간테이블 저장(강의-유저)
      await this.courseUserService.saveCourseUserRepo(
        courseIds,
        userId,
        queryRunner.manager,
      );

      // 학생수 업데이트
      await this.courseService.updateCourseStudents(
        courseIds,
        EOrderAction.Create,
        queryRunner.manager,
      );

      // 장바구니 비우기
      await this.cartService.clearCartWithTransaction(
        userId,
        courseIds,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateOrderName(
    firstTitle: string,
    courseLength: number,
  ): Promise<string> {
    if (courseLength === 1) {
      return firstTitle;
    } else {
      return `${firstTitle} 외 ${courseLength - 1}개 `;
    }
  }
}
