import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { OrderListQueryDto } from '@src/order/dtos/query/order-list.query.dto';
import { CreateOrderDto } from '@src/order/dtos/request/create-order.dto';
import {
  OrderDetailResponseDto,
  OrdersResponseDto,
} from '@src/order/dtos/response/order.response.dto';
import { OrderEntity } from '@src/order/entities/order.entity';
import { EOrderStatus } from '@src/order/enums/order.enum';
import { OrderCourseEntity } from '@src/order_course/entities/order-course.entity';

export const mockCreateOrderDto: CreateOrderDto = {
  courseIds: ['uuid1', 'uuid2'],
  imp_uid: 'imp_1234',
  price: 50000,
};

export const mockCreatedOrder = {
  id: 'uuid',
  orderName: '주문명',
  imp_uid: 'imp1234',
  merchant_uid: 'nobody_1234',
  totalOrderPrice: 50000,
  paymentMethod: 'card',
  fk_user_id: 'uuid',
  orderStatus: EOrderStatus.COMPLETED,
  created_at: new Date('2023-10'),
} as OrderEntity;

export const mockOrders = [
  [
    {
      id: 'uuid',
      orderName: '주문명',
      imp_uid: 'imp_1234',
      merchant_uid: 'nobody_1234',
      totalOrderPrice: 50000,
      paymentMethod: 'card',
      fk_user_id: 'uuid',
      orderStatus: EOrderStatus.COMPLETED,
      created_at: new Date('2023-10'),
    },
  ],
  10,
] as [OrderEntity[], number];

const pageMetaOrders = new PageMetaDto({
  pageOptionDto: new OrderListQueryDto(),
  itemCount: mockOrders[1],
});

export const expectedOrders = new PageDto(
  mockOrders[0].map((o) => OrdersResponseDto.from(o)),
  pageMetaOrders,
);

export const mockOrderDetail = {
  id: 'uuid',
  orderName: '주문명',
  imp_uid: 'imp_1234',
  merchant_uid: 'nobody_1234',
  totalOrderPrice: 50000,
  paymentMethod: 'card',
  fk_user_id: 'uuid',
  created_at: new Date('2023-10'),
  orderStatus: EOrderStatus.COMPLETED,
  ordersCourses: [
    {
      id: 'uuid',
      orderPrice: 50000,
      fk_order_id: 'uuid',
      fk_course_id: 'uuid',
      created_at: new Date('2023-10'),
      course: {
        id: 'uuid',
        title: '강의',
        learnable: [],
        recommendedFor: [],
        prerequisite: [],
        level: ECourseLevelType.Beginner,
        summary: '두줄요약',
        description: '설명',
        price: 10000,
        coverImage: null,
        averageRating: 0.0,
        reviewCount: 0,
        wishCount: 0,
        totalVideosTime: 0,
        totalLessonCount: 0,
        students: 0,
        created_at: new Date('2023-10'),
        updated_at: new Date('2023-10'),
        fk_instructor_id: 'uuid',
      } as CourseEntity,
    },
  ] as OrderCourseEntity[],
} as OrderEntity;

export const expectedOrderDetail = OrderDetailResponseDto.from(mockOrderDetail);

export const mockOrderRepository = {
  findAndCount: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
};

export const mockIamportService = {
  getPaymentData: jest.fn(),
};

export const mockOrderCourseService = {
  saveOrderCourseRepoWithTransaction: jest.fn(),
};

export const mockCartService = {
  clearCartWithTransaction: jest.fn(),
};

export const mockCourseUserService = {
  saveCourseUserRepo: jest.fn(),
};

export const mockCourseService = {
  updateCourseStudents: jest.fn(),
};

export const mockOrderService = {
  findOrders: jest.fn(),
  findOrderDetail: jest.fn(),
  create: jest.fn(),
};

export const mockIamportData = {
  amount: 10000,
  apply_num: null,
  bank_code: null,
  bank_name: null,
  buyer_addr: null,
  buyer_email: '',
  buyer_name: '',
  buyer_postcode: null,
  buyer_tel: '',
  cancel_amount: 0,
  cancel_history: [],
  cancel_reason: null,
  cancel_receipt_urls: [],
  cancelled_at: 0,
  card_code: null,
  card_name: null,
  card_number: null,
  card_quota: 0,
  card_type: null,
  cash_receipt_issued: false,
  channel: 'pc',
  currency: 'KRW',
  custom_data: null,
  customer_uid: null,
  customer_uid_usage: null,
  emb_pg_provider: null,
  escrow: false,
  fail_reason: null,
  failed_at: 0,
  imp_uid: '',
  merchant_uid: '',
  name: '',
  paid_at: 0,
  pay_method: 'card',
  pg_id: 'tlgdacomxpay',
  pg_provider: 'uplus',
  pg_tid: null,
  receipt_url: '',
  started_at: 1696496974,
  status: 'ready',
  user_agent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  vbank_code: null,
  vbank_date: 0,
  vbank_holder: null,
  vbank_issued_at: 0,
  vbank_name: null,
  vbank_num: null,
};
