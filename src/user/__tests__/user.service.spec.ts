import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { CartService } from '@src/cart/cart.service';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { UserService } from '@src/user/user.service';
import { DataSource, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '@src/user/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  mockCreateUserDto,
  mockNickNameDto,
  mockUpdateUserDto,
  mockUserByEmail,
  mockJwtPayload,
  mockInstructor,
  mockPhoneCheckDto,
  mockPhoneDto,
} from '@test/__mocks__/mock-data';
import {
  mockInstructorRepository,
  mockUserRepository,
} from '@test/__mocks__/mock-repository';
import {
  mockAwsS3Service,
  mockCartService,
  mockCoolsmsService,
  mockRedisService,
} from '@test/__mocks__/mock-service';
import { RedisService } from '@src/redis/redis.service';
import { CoolsmsService } from '@src/coolsms/coolsms.service';
import { ERoleType } from '@src/user/enums/user.enum';
import { SingleMessageSentResponse } from 'coolsms-node-sdk';
import { coolsmsUserPhoneKey } from '@src/redis/keys';

jest.mock('../../common/utils/randomToken.ts', () => ({
  createRandomToken: jest.fn().mockReturnValue('test'),
}));

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
  let redisService: RedisService;
  let coolsmsService: CoolsmsService;
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
          provide: RedisService,
          useValue: mockRedisService,
        },
        { provide: CoolsmsService, useValue: mockCoolsmsService },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(InstructorProfileEntity),
          useValue: mockInstructorRepository,
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
    redisService = module.get<RedisService>(RedisService);
    coolsmsService = module.get<CoolsmsService>(CoolsmsService);
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
    expect(redisService).toBeDefined();
    expect(cartService).toBeDefined();
    expect(coolsmsService).toBeDefined();
    expect(instructorProfileRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('[유저 회원가입]', () => {
    it('유저 회원가입 성공', async () => {
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockUserByEmail);

      const result = await userService.create(mockCreateUserDto);

      expect(result).toEqual(mockUserByEmail);
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
  });

  describe('[회원가입 시 닉네임 체크]', () => {
    it('중복되는 닉네임이 없는 경우 - 성공', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);

      const result = await userService.checkNick(mockNickNameDto);

      expect(userService.findOneByOptions).toBeCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('중복되는 닉네임이 있는 경우 - 실패(400)에러', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockUserByEmail);

      try {
        await userService.checkNick(mockNickNameDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
      expect(userService.findOneByOptions).toBeCalledTimes(1);
    });
  });

  describe('[유저 프로필 수정]', () => {
    it('유저 프로필 수정 성공', async () => {
      const mockUpdateUser = Object.assign(mockUserByEmail, mockUpdateUserDto);

      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockUserByEmail);
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockUpdateUser);

      const result = await userService.update(userId, mockUpdateUserDto);

      expect(result).toEqual(mockUpdateUser);
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
        .mockResolvedValue(mockUserByEmail);
      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockResolvedValue(mockUserByEmail);

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
        .mockResolvedValue(mockUserByEmail);
      jest
        .spyOn(userRepository, 'softDelete')
        .mockResolvedValue({ raw: [], generatedMaps: [], affected: 1 });
      jest.spyOn(cartService, 'removeCart').mockResolvedValue(undefined);

      const result = await userService.delete(mockJwtPayload);

      expect(result).toBeUndefined();
      expect(instructorProfileRepository.softDelete).toBeCalledTimes(0);
      expect(cartService.removeCart).toBeCalledTimes(1);
      expect(cartService.removeCart).toBeCalledWith(userId);
    });

    it('유저 회원탈퇴 성공 - 지식공유자일 경우', async () => {
      const mockJwtPayloadInstructor = {
        ...mockJwtPayload,
        role: ERoleType.Instructor,
      };

      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockInstructor);
      jest
        .spyOn(instructorProfileRepository, 'softDelete')
        .mockResolvedValue({ raw: [], generatedMaps: [], affected: 1 });
      jest.spyOn(cartService, 'removeCart').mockResolvedValue(undefined);
      jest
        .spyOn(userRepository, 'softDelete')
        .mockResolvedValue({ raw: [], generatedMaps: [], affected: 1 });

      const result = await userService.delete(mockJwtPayloadInstructor);

      expect(result).toBeUndefined();
      expect(instructorProfileRepository.softDelete).toBeCalledWith({
        fk_user_id: mockJwtPayloadInstructor.id,
      });
      expect(cartService.removeCart).toBeCalledTimes(1);
      expect(cartService.removeCart).toBeCalledWith(userId);
    });

    it('유저/지식공유자 탈퇴 실패 - 해당 유저/지식공유자가 없는 경우(404에러)', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await userService.delete(mockJwtPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[유저 프로필 조회]', () => {
    it('유저 프로필 조회 성공', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockUserByEmail);

      const result = await userService.getProfile(userId);

      expect(result).toEqual(mockUserByEmail);
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
        .mockResolvedValue(mockUserByEmail);
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
      const mockUserWithAvatar = {
        ...mockUserByEmail,
        profileAvatar: uploadUrl,
      } as UserEntity;

      const updateUrl =
        'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697697807404_dog.jpg';

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockUserWithAvatar);
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

  describe('[핸드폰 인증번호 검증]', () => {
    it('검증 성공', async () => {
      jest
        .spyOn(redisService, 'get')
        .mockResolvedValue(mockPhoneCheckDto.token);
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      const result = await userService.checkToken(userId, mockPhoneCheckDto);

      expect(result).toBeUndefined();
      expect(userRepository.update).toBeCalled();
    });

    it('검증 실패 - 인증번호를 안 받고 하는 경우(400에러)', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);

      try {
        await userService.checkToken(userId, mockPhoneCheckDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(userRepository.update).toBeCalledTimes(0);
      }
    });

    it('검증 실패 - 인증번호가 틀린 경우(400에러)', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue('anther_token');

      try {
        await userService.checkToken(userId, mockPhoneCheckDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(userRepository.update).toBeCalledTimes(0);
      }
    });
  });

  describe('[핸드폰 인증번호 전송 - coolsms]', () => {
    it('전송 성공', async () => {
      const mockSingleMessageSentResponse: SingleMessageSentResponse = {
        groupId: '',
        to: '',
        from: '',
        type: 'SMS',
        statusMessage: '정상 접수(이통사로 접수 예정) ',
        country: '82',
        messageId: '',
        statusCode: '2000',
        accountId: '',
      };
      const mockToken = 'test';

      jest
        .spyOn(coolsmsService, 'sendSMS')
        .mockResolvedValue(mockSingleMessageSentResponse);
      jest.spyOn(redisService, 'set').mockResolvedValue('OK');

      const result = await userService.sendSMS(mockPhoneDto);

      expect(result).toBeUndefined();
      expect(coolsmsService.sendSMS).toBeCalledTimes(1);
      expect(coolsmsService.sendSMS).toBeCalledWith(
        mockPhoneDto.phone,
        mockToken,
      );
      expect(redisService.set).toBeCalledTimes(1);
      expect(redisService.set).toBeCalledWith(
        coolsmsUserPhoneKey(mockPhoneDto.phone),
        mockToken,
        180,
      );
    });
  });
});
