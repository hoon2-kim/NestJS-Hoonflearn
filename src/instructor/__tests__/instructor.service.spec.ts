import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/auth/auth.service';
import { CourseService } from '@src/course/course.service';
import { InstructorService } from '@src/instructor/instructor.service';
import { QuestionService } from '@src/question/question.service';
import { ReviewService } from '@src/review/review.service';
import { UserEntity } from '@src/user/entities/user.entity';
import { UserService } from '@src/user/user.service';
import { Repository } from 'typeorm';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from '@src/instructor/dtos/instructor.query.dto';
import { RedisService } from '@src/redis/redis.service';
import {
  mockCourseRepository,
  mockInstructorRepository,
  mockUserRepository,
} from '@test/__mocks__/mock-repository';
import {
  mockAuthService,
  mockCourseService,
  mockQuestionService,
  mockRedisService,
  mockReviewService,
  mockUserService,
} from '@test/__mocks__/mock-service';
import {
  mockCreateInstructorDto,
  mockInstructor,
  mockInstructorProfile,
  mockJwtPayload,
  mockJwtTokens,
  mockPaidCourse,
  mockQuestion,
  mockReview,
  mockUserByEmail,
} from '@test/__mocks__/mock-data';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { ReviewEntity } from '@src/review/entities/review.entity';

describe('InstructorService', () => {
  let instructorService: InstructorService;
  let instructorRepository: Repository<InstructorProfileEntity>;
  let userRepository: Repository<UserEntity>;
  let courseRepository: Repository<CourseEntity>;
  let userService: UserService;
  let authService: AuthService;
  let courseService: CourseService;
  let questionService: QuestionService;
  let reviewService: ReviewService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorService,
        {
          provide: getRepositoryToken(InstructorProfileEntity),
          useValue: mockInstructorRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(CourseEntity),
          useValue: mockCourseRepository,
        },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: QuestionService, useValue: mockQuestionService },
        { provide: ReviewService, useValue: mockReviewService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    instructorService = module.get<InstructorService>(InstructorService);
    instructorRepository = module.get<Repository<InstructorProfileEntity>>(
      getRepositoryToken(InstructorProfileEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    courseRepository = module.get<Repository<CourseEntity>>(
      getRepositoryToken(CourseEntity),
    );
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    courseService = module.get<CourseService>(CourseService);
    questionService = module.get<QuestionService>(QuestionService);
    reviewService = module.get<ReviewService>(ReviewService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(instructorService).toBeDefined();
    expect(instructorRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userService).toBeDefined();
    expect(authService).toBeDefined();
    expect(courseService).toBeDefined();
    expect(questionService).toBeDefined();
    expect(reviewService).toBeDefined();
    expect(redisService).toBeDefined();
  });

  describe('[지식공유자 등록]', () => {
    const mockResponse = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;

    it('지식공유자 등록 성공', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);
      jest
        .spyOn(instructorRepository, 'save')
        .mockResolvedValue(mockInstructorProfile);
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });
      jest.spyOn(authService, 'getJwtTokens').mockResolvedValue(mockJwtTokens);
      jest.spyOn(redisService, 'set').mockResolvedValue('OK');

      const result = await instructorService.create(
        mockCreateInstructorDto,
        mockUserByEmail,
        mockResponse,
      );

      expect(result).toEqual(mockJwtTokens);
      expect(instructorRepository.save).toBeCalled();
      expect(userRepository.update).toBeCalled();
      expect(authService.getJwtTokens).toBeCalled();
      expect(mockResponse.cookie).toBeCalledWith('refreshToken', 'refresh', {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: 'none',
        path: '/',
        maxAge: expect.any(Number),
      });
      expect(redisService.set).toBeCalled();
    });

    it('지식공유자 등록 실패 - 이미 등록한 경우(400에러)', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockInstructor);

      try {
        await instructorService.create(
          mockCreateInstructorDto,
          mockUserByEmail,
          mockResponse,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('지식공유자 등록 실패 - 이메일or실명or사업체명이 중복일 경우(400에러)', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);

      jest
        .spyOn(instructorRepository, 'findOne')
        .mockResolvedValue(mockInstructorProfile);

      try {
        await instructorService.create(
          mockCreateInstructorDto,
          mockUserByEmail,
          mockResponse,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[내(지식공유자)가 만든 강의 조회]', () => {
    let query: InstructorCourseQueryDto;
    const mockCourseListByInstructor = [[mockPaidCourse], 1] as [
      CourseEntity[],
      number,
    ];
    const pageMeta = new PageMetaDto({
      pageOptionDto: new InstructorCourseQueryDto(),
      itemCount: mockCourseListByInstructor[1],
    });
    const expectedCourseListByInstructor = new PageDto(
      mockCourseListByInstructor[0],
      pageMeta,
    );

    beforeEach(() => {
      query = new InstructorCourseQueryDto();
    });

    it('강의 조회 성공', async () => {
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockCourseListByInstructor);

      const result = await instructorService.getMyCoursesByInstructor(
        query,
        mockInstructor,
      );

      expect(result).toEqual(expectedCourseListByInstructor);
      expect(courseRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledTimes(1);
      expect(
        courseRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });
  });

  describe('[내(지식공유자)가 만든 강의의 질문글 조회]', () => {
    let query: InstructorQuestionQueryDto;
    const mockQuestionListByMyCourse = [
      [
        {
          ...mockQuestion,
          course: mockPaidCourse,
          user: mockUserByEmail,
        },
      ],
      1,
    ] as [QuestionEntity[], number];
    const pageMeta = new PageMetaDto({
      pageOptionDto: new InstructorCourseQueryDto(),
      itemCount: mockQuestionListByMyCourse[1],
    });
    const expectedQuestionListByMCourse = new PageDto(
      mockQuestionListByMyCourse[0],
      pageMeta,
    );
    const courseIds = [mockPaidCourse.id];

    beforeEach(() => {
      query = new InstructorQuestionQueryDto();
    });

    it('질문글 조회 성공', async () => {
      jest
        .spyOn(courseService, 'getCourseIdsByInstructor')
        .mockResolvedValue(courseIds);
      jest
        .spyOn(questionService, 'findQuestionsByInstructorCourse')
        .mockResolvedValue(expectedQuestionListByMCourse);

      const result = await instructorService.getQuestionsByMyCourses(
        query,
        mockJwtPayload,
      );

      expect(result).toEqual(expectedQuestionListByMCourse);
      expect(courseService.getCourseIdsByInstructor).toBeCalledTimes(1);
      expect(questionService.findQuestionsByInstructorCourse).toBeCalledTimes(
        1,
      );
    });
  });

  describe('[내(지식공유자)가 만든 강의의 리뷰들 조회]', () => {
    let query: InstructorReviewQueryDto;
    const mockReviewListByMyCourse = [
      [
        {
          ...mockReview,
          course: mockPaidCourse,
          user: mockUserByEmail,
        },
      ],
      1,
    ] as [ReviewEntity[], number];
    const pageMeta = new PageMetaDto({
      pageOptionDto: new InstructorReviewQueryDto(),
      itemCount: mockReviewListByMyCourse[1],
    });
    const expectedReviewListByMyCourse = new PageDto(
      mockReviewListByMyCourse[0],
      pageMeta,
    );
    const courseIds = [mockPaidCourse.id];

    beforeEach(() => {
      query = new InstructorReviewQueryDto();
    });

    it('리뷰들 조회 성공', async () => {
      jest
        .spyOn(courseService, 'getCourseIdsByInstructor')
        .mockResolvedValue(courseIds);
      jest
        .spyOn(reviewService, 'findReviewsByInstructorCourse')
        .mockResolvedValue(expectedReviewListByMyCourse);

      const result = await instructorService.getReviewsByMyCourses(
        query,
        mockJwtPayload,
      );

      expect(result).toEqual(expectedReviewListByMyCourse);
      expect(courseService.getCourseIdsByInstructor).toBeCalledTimes(1);
      expect(reviewService.findReviewsByInstructorCourse).toBeCalledTimes(1);
    });
  });
});
