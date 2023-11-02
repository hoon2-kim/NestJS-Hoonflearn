import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from '@src/cart/cart.controller';
import { CartService } from '@src/cart/cart.service';
import {
  expectedMyCart,
  mockCartService,
  mockCreateCartDto,
  mockCreatedCart,
} from '@test/__mocks__/cart.mock';

describe('CartController', () => {
  let cartController: CartController;
  let cartService: CartService;

  const courseId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cartController).toBeDefined();
    expect(cartService).toBeDefined();
  });

  describe('[CartController.findCartByUser] - 내 장바구니 조회', () => {
    it('조회 성공', async () => {
      jest.spyOn(cartService, 'findMyCart').mockResolvedValue(expectedMyCart);

      const result = await cartController.findCartByUser(userId);

      expect(result).toEqual(expectedMyCart);
      expect(cartService.findMyCart).toBeCalled();
      expect(cartService.findMyCart).toBeCalledWith(userId);
    });
  });

  describe('[CartController.insertCourseInCart] - 장바구니에 강의 담기', () => {
    it('담기 성공', async () => {
      jest.spyOn(cartService, 'create').mockResolvedValue(mockCreatedCart);

      const result = await cartController.insertCourseInCart(
        mockCreateCartDto,
        userId,
      );

      expect(result).toEqual(mockCreatedCart);
      expect(cartService.create).toBeCalled();
      expect(cartService.create).toBeCalledWith(mockCreateCartDto, userId);
    });
  });

  describe('[CartController.deleteCourseInCart] - 장바구니에 담은 강의 삭제', () => {
    it('삭제 성공', async () => {
      jest.spyOn(cartService, 'delete').mockResolvedValue(true);

      const result = await cartController.deleteCourseInCart(courseId, userId);

      expect(result).toBe(true);
      expect(cartService.delete).toBeCalled();
      expect(cartService.delete).toBeCalledWith(courseId, userId);
    });
  });
});
