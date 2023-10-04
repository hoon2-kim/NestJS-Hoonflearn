import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { CartService } from '@src/cart/cart.service';
import { UserService } from '@src/user/user.service';

export const mockAwsS3Service = {
  uploadFileToS3: jest.fn(),
  deleteS3Object: jest.fn(),
};

export const mockCartService = {
  removeCart: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        CartService,
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
});
