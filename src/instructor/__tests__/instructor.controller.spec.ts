import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from '@src/instructor/instructor.controller';
import { InstructorService } from '@src/instructor/instructor.service';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from '@src/instructor/dtos/instructor.query.dto';
import { Response } from 'express';
import { mockInstructorService } from '@test/__mocks__/mock-service';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import {
  mockPaidCourse,
  mockCreateInstructorDto,
  mockJwtPayload,
  mockQuestion,
  mockUserByEmail,
  mockReview,
  mockJwtTokens,
} from '@test/__mocks__/mock-data';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { ReviewEntity } from '@src/review/entities/review.entity';

describe('InstructorController', () => {
  let instructorController: InstructorController;
  let instructorService: InstructorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorController],
      providers: [
        {
          provide: InstructorService,
          useValue: mockInstructorService,
        },
      ],
    }).compile();

    instructorController =
      module.get<InstructorController>(InstructorController);
    instructorService = module.get<InstructorService>(InstructorService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(instructorController).toBeDefined();
    expect(instructorService).toBeDefined();
  });

  describe('[InstructorController.findMyCourse] - 지식공유자가 만든 강의 조회', () => {
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

    it('조회 성공', async () => {
      jest
        .spyOn(instructorService, 'getMyCoursesByInstructor')
        .mockResolvedValue(expectedCourseListByInstructor);

      const result = await instructorController.findMyCourses(
        query,
        mockJwtPayload,
      );

      expect(result).toEqual(expectedCourseListByInstructor);
      expect(instructorService.getMyCoursesByInstructor).toBeCalled();
      expect(instructorService.getMyCoursesByInstructor).toBeCalledWith(
        query,
        mockJwtPayload,
      );
    });
  });

  describe('[InstructorController.getQuestionsMyCourses] - 지식공유자가 만든 강의의 질문글 조회', () => {
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

    beforeEach(() => {
      query = new InstructorQuestionQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(instructorService, 'getQuestionsByMyCourses')
        .mockResolvedValue(expectedQuestionListByMCourse);

      const result = await instructorController.getQuestionsMyCourses(
        query,
        mockJwtPayload,
      );

      expect(result).toEqual(expectedQuestionListByMCourse);
      expect(instructorService.getQuestionsByMyCourses).toBeCalled();
      expect(instructorService.getQuestionsByMyCourses).toBeCalledWith(
        query,
        mockJwtPayload,
      );
    });
  });

  describe('[InstructorController.getReviewsMyCourses] - 지식공유자가 만든 강의의 리뷰들 조회', () => {
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

    beforeEach(() => {
      query = new InstructorReviewQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(instructorService, 'getReviewsByMyCourses')
        .mockResolvedValue(expectedReviewListByMyCourse);

      const result = await instructorController.getReviewsMyCourses(
        query,
        mockJwtPayload,
      );

      expect(result).toEqual(expectedReviewListByMyCourse);
      expect(instructorService.getReviewsByMyCourses).toBeCalled();
      expect(instructorService.getReviewsByMyCourses).toBeCalledWith(
        query,
        mockJwtPayload,
      );
    });
  });

  describe('[InstructorController.registerInstructor] - 지식공유자 등록', () => {
    const mockResponse = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;

    it('등록 성공', async () => {
      jest.spyOn(instructorService, 'create').mockResolvedValue(mockJwtTokens);

      const result = await instructorController.registerInstructor(
        mockCreateInstructorDto,
        mockJwtPayload,
        mockResponse,
      );

      expect(result).toEqual(mockJwtTokens);
      expect(instructorService.create).toBeCalled();
      expect(instructorService.create).toBeCalledWith(
        mockCreateInstructorDto,
        mockJwtPayload,
        mockResponse,
      );
    });
  });
});
