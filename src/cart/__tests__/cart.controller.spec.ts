import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from '@src/cart/cart.controller';
import { CartService } from '@src/cart/cart.service';
import { mockCart, mockCreateCartDto } from '@test/__mocks__/mock-data';
import { mockCartService } from '@test/__mocks__/mock-service';

describe('CartController', () => {
  let cartController: CartController;
  let cartService: CartService;

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
      const expectedMyCart = mockCart;
      const userId = 'uuid';

      jest.spyOn(cartService, 'findMyCart').mockResolvedValue(expectedMyCart);

      const result = await cartController.findCartByUser(userId);

      expect(result).toEqual(expectedMyCart);
      expect(cartService.findMyCart).toBeCalled();
      expect(cartService.findMyCart).toBeCalledWith(userId);
    });
  });

  describe('[CartController.insertCourseInCart] - 장바구니에 강의 담기', () => {
    it('담기 성공', async () => {
      const userId = 'uuid';

      jest.spyOn(cartService, 'create').mockResolvedValue(mockCart);

      const result = await cartController.insertCourseInCart(
        mockCreateCartDto,
        userId,
      );

      expect(result).toEqual(mockCart);
      expect(cartService.create).toBeCalled();
      expect(cartService.create).toBeCalledWith(mockCreateCartDto, userId);
    });
  });

  describe('[CartController.deleteCourseInCart] - 장바구니에 담은 강의 삭제', () => {
    it('삭제 성공', async () => {
      const courseId = 'uuid';
      const userId = 'uuid';

      jest.spyOn(cartService, 'delete').mockResolvedValue(undefined);

      const result = await cartController.deleteCourseInCart(courseId, userId);

      expect(result).toBeUndefined();
      expect(cartService.delete).toBeCalled();
      expect(cartService.delete).toBeCalledWith(courseId, userId);
    });
  });
});
