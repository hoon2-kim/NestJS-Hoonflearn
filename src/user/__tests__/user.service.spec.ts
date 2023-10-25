import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { CartService } from '@src/cart/cart.service';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { UserService } from '@src/user/user.service';
import {
  mockAwsS3Service,
  mockCartService,
  mockCreatedInstructor,
  mockInstructorProfileRepository,
  mockCreatedUser,
  mockUserProfile,
  mockUserRepository,
  mockCreateUserDto,
  mockNickNameDto,
  mockUpdateUserDto,
} from '@test/__mocks__/user.mock';
import { DataSource, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '@src/user/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockInstructorProfile } from '@test/__mocks__/instructorProfile.mock';

const mockQueryRunner = {
  manager: {},
} as QueryRunner;

class MockDataSource {
  createQueryRunner(): QueryRunner {
    return mockQueryRunner;
  }
}

describe('UserService', () => {
  let userService: UserService;
  let awsS3Service: AwsS3Service;
  let cartService: CartService;
  let userRepository: Repository<UserEntity>;
  let instructorProfileRepository: Repository<InstructorProfileEntity>;
  let dataSource: DataSource;

  const userId = 'uuid';

  beforeEach(async () => {
    Object.assign(mockQueryRunner.manager, {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    });

    mockQueryRunner.connect = jest.fn();
    mockQueryRunner.startTransaction = jest.fn();
    mockQueryRunner.commitTransaction = jest.fn();
    mockQueryRunner.rollbackTransaction = jest.fn();
    mockQueryRunner.release = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(InstructorProfileEntity),
          useValue: mockInstructorProfileRepository,
        },
        {
          provide: DataSource,
          useClass: MockDataSource,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    cartService = module.get<CartService>(CartService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    instructorProfileRepository = module.get<
      Repository<InstructorProfileEntity>
    >(getRepositoryToken(InstructorProfileEntity));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(awsS3Service).toBeDefined();
    expect(cartService).toBeDefined;
    expect(instructorProfileRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('[유저 회원가입]', () => {
    it('유저 회원가입 성공', async () => {
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockCreatedUser);

      const result = await userService.create(mockCreateUserDto);

      expect(result).toEqual(mockCreatedUser);
    });

    it('유저 회원가입 실패 - 이메일 중복(400에러)', async () => {
      jest.spyOn(mockUserRepository, 'save').mockRejectedValue({
        code: '23505',
        detail: `Key (email)=(${mockCreateUserDto.email}) already exists.`,
      });

      try {
        await userService.create(mockCreateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('유저 회원가입 실패 - 핸드폰 번호 중복(400에러)', async () => {
      jest.spyOn(mockUserRepository, 'save').mockRejectedValue({
        code: '23505',
        detail: `Key (phone)=(${mockCreateUserDto.phone}) already exists.`,
      });

      try {
        await userService.create(mockCreateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[회원가입 시 닉네임 체크]', () => {
    it('중복되는 닉네임이 없는 경우 - 성공', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);

      const result = await userService.checkNick(mockNickNameDto);

      expect(userService.findOneByOptions).toBeCalledTimes(1);
      expect(result).toEqual({
        message: `해당 닉네임:${mockNickNameDto.nickname}은 사용가능합니다.`,
      });
    });

    it('중복되는 닉네임이 있는 경우 - 실패(400)에러', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);

      try {
        await userService.checkNick(mockNickNameDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
      expect(userService.findOneByOptions).toBeCalledTimes(1);
    });
  });

  describe('[유저 프로필 수정]', () => {
    const mockUpdateResult = { message: '수정 성공' };

    it('유저 프로필 수정 성공', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockCreatedUser);

      const result = await userService.update(userId, mockUpdateUserDto);

      expect(result).toEqual(mockUpdateResult);
    });

    it('유저 프로필 수정 실패 - 해당 유저가 없는 경우(404에러)', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await userService.update(userId, mockUpdateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('유저 프로필 수정 실패 - 중복된 닉네임인 경우(400에러)', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockResolvedValue(mockCreatedUser);

      try {
        await userService.update(userId, mockUpdateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[유저 회원탈퇴]', () => {
    it('유저 회원탈퇴 성공 - 일반 유저일 경우', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedUser);
      jest
        .spyOn(mockUserRepository, 'softDelete')
        .mockResolvedValue({ affected: 1 });
      jest
        .spyOn(mockInstructorProfileRepository, 'findOne')
        .mockResolvedValue(null);
      jest.spyOn(cartService, 'removeCart').mockResolvedValue(undefined);

      const result = await userService.delete(userId);

      expect(result).toBe(true);
      expect(instructorProfileRepository.findOne).toBeCalledTimes(1);
      expect(cartService.removeCart).toBeCalledTimes(1);
      expect(cartService.removeCart).toBeCalledWith(userId);
    });

    it('유저 회원탈퇴 성공 - 지식공유자일 경우', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedInstructor);
      jest
        .spyOn(mockUserRepository, 'softDelete')
        .mockResolvedValue({ affected: 1 });
      jest
        .spyOn(mockInstructorProfileRepository, 'findOne')
        .mockResolvedValue(mockInstructorProfile);
      jest
        .spyOn(mockInstructorProfileRepository, 'softDelete')
        .mockResolvedValue({ affected: 1 });
      jest.spyOn(cartService, 'removeCart').mockResolvedValue(undefined);

      const result = await userService.delete(userId);

      expect(result).toBe(true);
      expect(instructorProfileRepository.findOne).toBeCalledTimes(1);
      expect(instructorProfileRepository.softDelete).toBeCalledWith({
        id: mockInstructorProfile.fk_user_id,
      });
      expect(cartService.removeCart).toBeCalledTimes(1);
      expect(cartService.removeCart).toBeCalledWith(userId);
    });

    it('유저/지식공유자 탈퇴 실패 - 해당 유저/지식공유자가 없는 경우(404에러)', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await userService.delete(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[유저 프로필 조회]', () => {
    it('유저 프로필 조회 성공', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockUserProfile);

      const result = await userService.getProfile(userId);

      expect(result).toEqual(mockUserProfile);
    });
  });

  describe('[유저 프로필 이미지 업로드]', () => {
    const file = {
      fieldname: 'avatar',
      originalname: 'pikachu.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('pikachu.jpg'),
      size: 32805,
    } as Express.Multer.File;

    const uploadUrl =
      'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697697807403_pikachu.jpg';

    const updateResult: UpdateResult = {
      generatedMaps: [],
      raw: [],
      affected: 1,
    };

    let queryRunner: QueryRunner;

    beforeEach(() => {
      queryRunner = dataSource.createQueryRunner();
    });

    it('유저 프로필 이미지 업로드 성공', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockCreatedUser);
      jest.spyOn(awsS3Service, 'uploadFileToS3').mockResolvedValue(uploadUrl);
      jest.spyOn(queryRunner.manager, 'update').mockResolvedValue(updateResult);

      const result = await userService.upload(userId, file);

      expect(result).toBe(uploadUrl);
      expect(queryRunner.manager.findOne).toBeCalledTimes(1);
      expect(awsS3Service.deleteS3Object).toBeCalledTimes(0);
      expect(awsS3Service.uploadFileToS3).toBeCalledTimes(1);
      expect(queryRunner.manager.update).toBeCalledTimes(1);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
    });

    it('유저 프로필 변경 성공 - awsS3Service의 delete 호출해야함', async () => {
      const mockCreatedUserWithAvatar = mockCreatedUser;
      mockCreatedUserWithAvatar.profileAvatar = uploadUrl;
      const updateUrl =
        'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697697807404_dog.jpg';

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockCreatedUserWithAvatar);
      jest
        .spyOn(awsS3Service, 'deleteS3Object')
        .mockResolvedValue({ success: true });
      jest.spyOn(awsS3Service, 'uploadFileToS3').mockResolvedValue(updateUrl);
      jest.spyOn(queryRunner.manager, 'update').mockResolvedValue(updateResult);

      const result = await userService.upload(userId, file);

      expect(result).toBe(updateUrl);
      expect(queryRunner.manager.findOne).toBeCalledTimes(1);
      expect(awsS3Service.deleteS3Object).toBeCalledTimes(1);
      expect(awsS3Service.uploadFileToS3).toBeCalledTimes(1);
      expect(queryRunner.manager.update).toBeCalledTimes(1);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
    });
  });
});
