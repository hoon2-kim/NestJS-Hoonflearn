import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseUserService } from '@src/course_user/course-user.service';
import { CourseWishService } from '@src/course_wish/course_wish.service';
import { QuestionService } from '@src/question/question.service';
import { UserController } from '@src/user/user.controller';
import { UserService } from '@src/user/user.service';
import {
  mockCourseUserService,
  mockCourseWishService,
  mockCreatedUser,
  mockCreateUserDto,
  mockNickNameDto,
  mockQuestionService,
  mockUpdateUserDto,
  mockUserProfile,
  mockUserService,
} from '@test/__mocks__/user.mock';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let questionService: QuestionService;
  let courseUserService: CourseUserService;
  let courseWishService: CourseWishService;

  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: QuestionService,
          useValue: mockQuestionService,
        },
        {
          provide: CourseUserService,
          useValue: mockCourseUserService,
        },
        {
          provide: CourseWishService,
          useValue: mockCourseWishService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    questionService = module.get<QuestionService>(QuestionService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
    courseWishService = module.get<CourseWishService>(CourseWishService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
    expect(questionService).toBeDefined();
    expect(courseUserService).toBeDefined();
    expect(courseWishService).toBeDefined();
  });

  describe('[UserController.getMyProfile] - 유저 프로필 조회', () => {
    it('프로필 조회 성공', async () => {
      jest.spyOn(userService, 'getProfile').mockResolvedValue(mockUserProfile);

      const result = await userController.getMyProfile(userId);

      expect(result).toEqual(mockUserProfile);
      expect(userService.getProfile).toHaveBeenCalled();
      expect(userService.getProfile).toBeCalledWith(userId);
    });
  });

  describe('[UserController.registerUser] - 유저 회원가입', () => {
    it('회원가입 성공', async () => {
      jest.spyOn(userService, 'create').mockResolvedValue(mockCreatedUser);

      const result = await userController.registerUser(mockCreateUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(userService.create).toHaveBeenCalled();
      expect(userService.create).toBeCalledWith(mockCreateUserDto);
    });
  });

  describe('[UserController.checkNickname] - 닉네임 중복체크', () => {
    it('중복체크 성공', async () => {
      jest.spyOn(userService, 'checkNick').mockResolvedValue({
        message: `해당 닉네임:${mockNickNameDto.nickname}은 사용가능합니다.`,
      });

      const result = await userController.checkNickname(mockNickNameDto);

      expect(result).toEqual({
        message: `해당 닉네임:${mockNickNameDto.nickname}은 사용가능합니다.`,
      });
      expect(userService.checkNick).toHaveBeenCalled();
      expect(userService.checkNick).toBeCalledWith(mockNickNameDto);
    });
  });

  describe('[UserController.updateUserProfile] - 유저 프로필 수정', () => {
    it('프로필 수정 성공', async () => {
      const updateResult = { message: '수정 성공' };

      jest.spyOn(userService, 'update').mockResolvedValue(updateResult);

      const result = await userController.updateUserProfile(
        userId,
        mockUpdateUserDto,
      );

      expect(result).toEqual(updateResult);
      expect(userService.update).toHaveBeenCalled();
      expect(userService.update).toBeCalledWith(userId, mockUpdateUserDto);
    });
  });

  describe('[UserController.uploadUserAvatar] - 유저 프로필 이미지 업로드', () => {
    const file = {
      fieldname: 'avatar',
      originalname: 'pikachu.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('pikachu.jpg'),
      size: 32805,
    } as Express.Multer.File;

    it('이미지 업로드 성공', async () => {
      const uploadUrl =
        'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697697807403_pikachu.jpg';

      jest.spyOn(userService, 'upload').mockResolvedValue(uploadUrl);

      const result = await userController.uploadUserAvatar(userId, file);

      expect(result).toBe(uploadUrl);
      expect(userService.upload).toHaveBeenCalled();
      expect(userService.upload).toBeCalledWith(userId, file);
    });

    it('이미지 업로드 실패 - 파일이 없는 경우(400에러)', async () => {
      try {
        await userController.uploadUserAvatar(userId, null);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('이미지 업로드 실패 - 파일이 limit사이즈를 초과한 경우(400에러)', async () => {
      const bigFile = { ...file, size: 1024 * 1024 * 2 };

      try {
        await userController.uploadUserAvatar(userId, bigFile);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('이미지 업로드 실패 - 이미지 확장자가 jpg,png,jpeg가 아닌 경우(400에러)', async () => {
      const etcFile = { ...file, mimetype: 'image/gif' };

      try {
        await userController.uploadUserAvatar(userId, etcFile);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[UserController.withdrawalUser] - 유저 회원탈퇴', () => {
    it('회원탈퇴 성공', async () => {
      jest.spyOn(userService, 'delete').mockResolvedValue(true);

      const result = await userController.withdrawalUser(userId);

      expect(result).toBe(true);
      expect(userService.delete).toHaveBeenCalled();
      expect(userService.delete).toBeCalledWith(userId);
    });
  });
});
