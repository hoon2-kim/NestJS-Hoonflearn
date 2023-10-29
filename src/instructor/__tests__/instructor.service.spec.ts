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
import {
  expectedCourseByInstructor,
  mockAuthService,
  mockCourseService,
  mockCreateInstructorDto,
  mockInstructor,
  mockInstructorProfile,
  mockInstructorRepository,
  mockMadeMyCourse,
  mockQuestionService,
  mockReviewService,
  mockUserRepository,
  mockUserService,
} from '@test/__mocks__/instructorProfile.mock';
import {
  mockCreatedInstructor,
  mockCreatedUser,
} from '@test/__mocks__/user.mock';
import { Response } from 'express';
import { IInstructorTokens } from '../interfaces/instructor.interface';
import { BadRequestException } from '@nestjs/common';
import { CourseIdsReponseDto } from '@src/course/dtos/response/course.response';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from '../dtos/query/instructor.query.dto';

import { mockCreatedCourse } from '@test/__mocks__/course.mock';
import { expectedQuestionByInstructor } from '@test/__mocks__/question.mock';
import { expectedReviewByInstructor } from '@test/__mocks__/review.mock';

describe('InstructorService', () => {
  let instructorService: InstructorService;
  let instructorRepository: Repository<InstructorProfileEntity>;
  let userRepository: Repository<UserEntity>;
  let userService: UserService;
  let authService: AuthService;
  let courseService: CourseService;
  let questionService: QuestionService;
  let reviewService: ReviewService;

  const user = mockCreatedInstructor;

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
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: QuestionService, useValue: mockQuestionService },
        { provide: ReviewService, useValue: mockReviewService },
      ],
    }).compile();

    instructorService = module.get<InstructorService>(InstructorService);
    instructorRepository = module.get<Repository<InstructorProfileEntity>>(
      getRepositoryToken(InstructorProfileEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    courseService = module.get<CourseService>(CourseService);
    questionService = module.get<QuestionService>(QuestionService);
    reviewService = module.get<ReviewService>(ReviewService);
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
  });

  describe('[지식공유자 등록]', () => {
    const user = mockCreatedUser;
    const mockResponse = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;
    // const at = 'access'
    // const rt = 'refresh'
    const createdResponse: IInstructorTokens = {
      access_token: 'access',
      refresh_token: 'refresh',
    };

    it('지식공유자 등록 성공', async () => {
      jest.spyOn(userService, 'findOneByOptions').mockResolvedValue(null);
      jest.spyOn(instructorRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(instructorRepository, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(instructorRepository, 'save')
        .mockResolvedValue(mockInstructor);
      jest
        .spyOn(userService, 'updateRefreshToken')
        .mockResolvedValue(undefined);

      const result = await instructorService.create(
        mockCreateInstructorDto,
        user,
        mockResponse,
      );

      expect(result).toEqual(createdResponse);
      expect(instructorRepository.save).toBeCalled();
      expect(mockResponse.cookie).toBeCalledWith('refreshToken', 'refresh', {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        path: '/',
      });
    });

    it('지식공유자 등록 실패 - 이미 등록한 경우(400에러)', async () => {
      jest
        .spyOn(userService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedInstructor);

      try {
        await instructorService.create(
          mockCreateInstructorDto,
          user,
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
          user,
          mockResponse,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[내(지식공유자)가 만든 강의 조회]', () => {
    let query: InstructorCourseQueryDto;

    beforeEach(() => {
      query = new InstructorCourseQueryDto();
    });

    it('강의 조회 성공', async () => {
      jest
        .spyOn(userRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue(mockMadeMyCourse);

      const result = await instructorService.getMyCoursesByInstructor(
        query,
        user,
      );

      expect(result).toEqual(expectedCourseByInstructor);
      expect(
        userRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(1);
      expect(userRepository.createQueryBuilder().leftJoin).toBeCalledTimes(1);
      expect(userRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(userRepository.createQueryBuilder().andWhere).toBeCalledTimes(1);
      expect(userRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(userRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(userRepository.createQueryBuilder().orderBy).toBeCalledTimes(1);
      expect(userRepository.createQueryBuilder().getMany).toBeCalledTimes(1);
    });
  });

  describe('[내(지식공유자)가 만든 강의의 질문글 조회]', () => {
    let query: InstructorQuestionQueryDto;

    beforeEach(() => {
      query = new InstructorQuestionQueryDto();
    });

    it('질문글 조회 성공', async () => {
      const courseIds = CourseIdsReponseDto.from([mockCreatedCourse]);

      jest
        .spyOn(courseService, 'getCourseIdsByInstructor')
        .mockResolvedValue(courseIds);
      jest
        .spyOn(questionService, 'findQuestionsByInstructorCourse')
        .mockResolvedValue(expectedQuestionByInstructor);

      const result = await instructorService.getQuestionsByMyCourses(
        query,
        user,
      );

      expect(result).toEqual(expectedQuestionByInstructor);
      expect(courseService.getCourseIdsByInstructor).toBeCalledTimes(1);
      expect(questionService.findQuestionsByInstructorCourse).toBeCalledTimes(
        1,
      );
    });
  });

  describe('[내(지식공유자)가 만든 강의의 리뷰들 조회]', () => {
    let query: InstructorReviewQueryDto;

    beforeEach(() => {
      query = new InstructorReviewQueryDto();
    });

    it('리뷰들 조회 성공', async () => {
      const courseIds = CourseIdsReponseDto.from([mockCreatedCourse]);

      jest
        .spyOn(courseService, 'getCourseIdsByInstructor')
        .mockResolvedValue(courseIds);
      jest
        .spyOn(reviewService, 'findReviewsByInstructorCourse')
        .mockResolvedValue(expectedReviewByInstructor);

      const result = await instructorService.getReviewsByMyCourses(query, user);

      expect(result).toEqual(expectedReviewByInstructor);
      expect(courseService.getCourseIdsByInstructor).toBeCalledTimes(1);
      expect(reviewService.findReviewsByInstructorCourse).toBeCalledTimes(1);
    });
  });
});
