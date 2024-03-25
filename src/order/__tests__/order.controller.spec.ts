import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '@src/order/order.controller';
import { OrderService } from '@src/order/order.service';
import { OrderListQueryDto } from '@src/order/dtos/order-list.query.dto';
import { mockOrderService } from '@test/__mocks__/mock-service';
import {
  mockCreateOrderDto,
  mockOrder,
  mockOrderCourse,
  mockPaidCourse,
} from '@test/__mocks__/mock-data';
import { OrderEntity } from '@src/order/entities/order.entity';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';

describe('OrderController', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  const orderId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderController).toBeDefined();
    expect(orderService).toBeDefined();
  });

  describe('[OrderController.findMyOrders] - 내 주문내역 조회', () => {
    it('조회 성공', async () => {
      const query = new OrderListQueryDto();
      const mockOrders = [
        [
          {
            ...mockOrder,
          },
        ],
        1,
      ] as [OrderEntity[], number];
      const pageMeta = new PageMetaDto({
        pageOptionDto: query,
        itemCount: mockOrders[1],
      });
      const expectedMockOrders = new PageDto(mockOrders[0], pageMeta);

      jest
        .spyOn(orderService, 'findOrders')
        .mockResolvedValue(expectedMockOrders);

      const result = await orderController.findMyOrders(query, userId);

      expect(result).toEqual(expectedMockOrders);
      expect(orderService.findOrders).toBeCalled();
      expect(orderService.findOrders).toBeCalledWith(query, userId);
    });
  });

  describe('[OrderController.findMyOrderDetail] - 주문내역 상세 조회', () => {
    it('조회 성공', async () => {
      const mockOrderDetail = {
        ...mockOrder,
        ordersCourses: [
          {
            ...mockOrderCourse,
            course: mockPaidCourse,
          },
        ],
      };

      jest
        .spyOn(orderService, 'findOrderDetail')
        .mockResolvedValue(mockOrderDetail);

      const result = await orderController.findMyOrderDetail(orderId, userId);

      expect(result).toEqual(mockOrderDetail);
      expect(orderService.findOrderDetail).toBeCalled();
      expect(orderService.findOrderDetail).toBeCalledWith(orderId, userId);
    });
  });

  describe('[OrderController.createOrder - 주문 완료', () => {
    it('주문 성공', async () => {
      jest.spyOn(orderService, 'create').mockResolvedValue(mockOrder);

      const result = await orderController.createOrder(
        mockCreateOrderDto,
        userId,
      );

      expect(result).toEqual(mockOrder);
      expect(orderService.create).toBeCalled();
      expect(orderService.create).toBeCalledWith(mockCreateOrderDto, userId);
    });
  });
});
