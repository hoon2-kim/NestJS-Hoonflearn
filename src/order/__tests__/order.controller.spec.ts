import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '@src/order/order.controller';
import { OrderService } from '@src/order/order.service';
import {
  expectedOrderDetail,
  expectedOrders,
  mockCreatedOrder,
  mockCreateOrderDto,
  mockOrderService,
} from '@test/__mocks__/order.mock';
import { OrderListQueryDto } from '@src/order/dtos/query/order-list.query.dto';

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

      jest.spyOn(orderService, 'findOrders').mockResolvedValue(expectedOrders);

      const result = await orderController.findMyOrders(query, userId);

      expect(result).toEqual(expectedOrders);
      expect(orderService.findOrders).toBeCalled();
      expect(orderService.findOrders).toBeCalledWith(query, userId);
    });
  });

  describe('[OrderController.findMyOrderDetail] - 주문내역 상세 조회', () => {
    it('조회 성공', async () => {
      jest
        .spyOn(orderService, 'findOrderDetail')
        .mockResolvedValue(expectedOrderDetail);

      const result = await orderController.findMyOrderDetail(orderId, userId);

      expect(result).toEqual(expectedOrderDetail);
      expect(orderService.findOrderDetail).toBeCalled();
      expect(orderService.findOrderDetail).toBeCalledWith(orderId, userId);
    });
  });

  describe('[OrderController.createOrder - 주문 완료', () => {
    it('주문 성공', async () => {
      jest.spyOn(orderService, 'create').mockResolvedValue(mockCreatedOrder);

      const result = await orderController.createOrder(
        mockCreateOrderDto,
        userId,
      );

      expect(result).toEqual(mockCreatedOrder);
      expect(orderService.create).toBeCalled();
      expect(orderService.create).toBeCalledWith(mockCreateOrderDto, userId);
    });
  });
});
