import { Test, TestingModule } from '@nestjs/testing';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AwsS3Service,
          useValue: {
            uploadFileToS3: jest.fn(),
            deleteS3Object: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
});
