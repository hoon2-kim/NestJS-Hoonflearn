import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseUserService } from '@src/course_user/course-user.service';
import { CourseWishService } from '@src/course/course-wish/course-wish.service';
import { QuestionService } from '@src/question/question.service';
import { UserController } from '@src/user/user.controller';
import { UserService } from '@src/user/user.service';
import {
  UserWishQueryDto,
  UserQuestionQueryDto,
  UserMyCourseQueryDto,
} from '@src/user/dtos/user.query.dto';
import {
  mockCourseUserWithPaid,
  mockCourseWish,
  mockCreateUserDto,
  mockInstructor,
  mockJwtPayload,
  mockNickNameDto,
  mockPaidCourse,
  mockQuestion,
  mockUpdateUserDto,
  mockUserByEmail,
} from '@test/__mocks__/mock-data';
import {
  mockUserService,
  mockQuestionService,
  mockCourseUserService,
  mockCourseWishService,
} from '@test/__mocks__/mock-service';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseWishEntity } from '@src/course/course-wish/entities/course-wish.entity';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';

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
      jest.spyOn(userService, 'getProfile').mockResolvedValue(mockUserByEmail);

      const result = await userController.getMyProfile(userId);

      expect(result).toEqual(mockUserByEmail);
      expect(userService.getProfile).toHaveBeenCalled();
      expect(userService.getProfile).toBeCalledWith(userId);
    });
  });

  describe('[UserController.registerUser] - 유저 회원가입', () => {
    it('회원가입 성공', async () => {
      jest.spyOn(userService, 'create').mockResolvedValue(mockUserByEmail);

      const result = await userController.registerUser(mockCreateUserDto);

      expect(result).toEqual(mockUserByEmail);
      expect(userService.create).toHaveBeenCalled();
      expect(userService.create).toBeCalledWith(mockCreateUserDto);
    });
  });

  describe('[UserController.checkNickname] - 닉네임 중복체크', () => {
    it('중복체크 성공', async () => {
      jest.spyOn(userService, 'checkNick').mockResolvedValue(undefined);

      const result = await userController.checkNickname(mockNickNameDto);

      expect(result).toBeUndefined();
      expect(userService.checkNick).toHaveBeenCalled();
      expect(userService.checkNick).toBeCalledWith(mockNickNameDto);
    });
  });

  describe('[UserController.updateUserProfile] - 유저 프로필 수정', () => {
    it('프로필 수정 성공', async () => {
      jest.spyOn(userService, 'update').mockResolvedValue(mockUserByEmail);

      const result = await userController.updateUserProfile(
        userId,
        mockUpdateUserDto,
      );

      expect(result).toEqual(mockUserByEmail);
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
      jest.spyOn(userService, 'delete').mockResolvedValue(undefined);

      const result = await userController.withdrawalUser(mockJwtPayload);

      expect(result).toBeUndefined();
      expect(userService.delete).toHaveBeenCalled();
      expect(userService.delete).toBeCalledWith(mockJwtPayload);
    });
  });

  describe('[UserController.getMyWishCourses] - 찜한 강의 조회', () => {
    it('조회 성공', async () => {
      const query = new UserWishQueryDto();
      const mockWishCourseList = [
        [
          {
            ...mockCourseWish,
            course: {
              ...mockPaidCourse,
              instructor: mockInstructor,
            },
          },
        ],
        1,
      ] as [CourseWishEntity[], number];
      const pageMeta = new PageMetaDto({
        pageOptionDto: new UserWishQueryDto(),
        itemCount: mockWishCourseList[1],
      });
      const expectedCourseWishList = new PageDto(
        mockWishCourseList[0],
        pageMeta,
      );

      jest
        .spyOn(courseWishService, 'findWishCoursesByUser')
        .mockResolvedValue(expectedCourseWishList);

      const result = await userController.getMyWishCourses(query, userId);

      expect(result).toEqual(expectedCourseWishList);
      expect(courseWishService.findWishCoursesByUser).toBeCalled();
      expect(courseWishService.findWishCoursesByUser).toBeCalledWith(
        query,
        userId,
      );
    });
  });

  describe('[UserController.getMyQuestions] - 유저가 작성한 질문글 조회', () => {
    it('조회 성공', async () => {
      const query = new UserQuestionQueryDto();
      const mockMyQuestionList = [
        [
          {
            ...mockQuestion,
            user: mockUserByEmail,
            course: mockPaidCourse,
          },
        ],
        1,
      ] as [QuestionEntity[], number];
      const pageMeta = new PageMetaDto({
        pageOptionDto: query,
        itemCount: mockMyQuestionList[1],
      });
      const expectedMockMyQuestionList = new PageDto(
        mockMyQuestionList[0],
        pageMeta,
      );

      jest
        .spyOn(questionService, 'findMyQuestions')
        .mockResolvedValue(expectedMockMyQuestionList);

      const result = await userController.getMyQuestions(query, userId);

      expect(result).toEqual(expectedMockMyQuestionList);
      expect(questionService.findMyQuestions).toBeCalled();
      expect(questionService.findMyQuestions).toBeCalledWith(query, userId);
    });
  });

  describe('[UserController.getMyCourses] - 유저가 수강하는 강의 조회', () => {
    it('조회 성공', async () => {
      const query = new UserMyCourseQueryDto();
      const mockCourseUserList = [
        [
          {
            id: mockCourseUserWithPaid.id,
            type: mockCourseUserWithPaid.type,
            created_at: mockCourseUserWithPaid.created_at,
            course: mockPaidCourse,
          },
        ],
        1,
      ] as [CourseUserEntity[], number];
      const pageMeta = new PageMetaDto({
        pageOptionDto: new UserMyCourseQueryDto(),
        itemCount: mockCourseUserList[1],
      });
      const expectedCourseUserList = new PageDto(
        mockCourseUserList[0],
        pageMeta,
      );

      jest
        .spyOn(courseUserService, 'findMyCourses')
        .mockResolvedValue(expectedCourseUserList);

      const result = await userController.getMyCourses(query, userId);

      expect(result).toEqual(expectedCourseUserList);
      expect(courseUserService.findMyCourses).toBeCalled();
      expect(courseUserService.findMyCourses).toBeCalledWith(query, userId);
    });
  });
});
