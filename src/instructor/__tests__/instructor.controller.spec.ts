import { Test, TestingModule } from '@nestjs/testing';
import { InstructorController } from '@src/instructor/instructor.controller';
import { InstructorService } from '@src/instructor/instructor.service';
import { mockCreatedInstructor } from '@test/__mocks__/user.mock';
import {
  expectedCourseByInstructor,
  mockCreateInstructorDto,
  mockInstructorService,
} from '@test/__mocks__/instructorProfile.mock';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from '@src/instructor/dtos/query/instructor.query.dto';
import { expectedQuestionByInstructor } from '@test/__mocks__/question.mock';
import { expectedReviewByInstructor } from '@test/__mocks__/review.mock';
import { Response } from 'express';
import { IInstructorTokens } from '@src/instructor/interfaces/instructor.interface';

describe('InstructorController', () => {
  let instructorController: InstructorController;
  let instructorService: InstructorService;

  const user = mockCreatedInstructor;

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

    beforeEach(() => {
      query = new InstructorCourseQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(instructorService, 'getMyCoursesByInstructor')
        .mockResolvedValue(expectedCourseByInstructor);

      const result = await instructorController.findMyCourses(query, user);

      expect(result).toEqual(expectedCourseByInstructor);
      expect(instructorService.getMyCoursesByInstructor).toBeCalled();
      expect(instructorService.getMyCoursesByInstructor).toBeCalledWith(
        query,
        user,
      );
    });
  });

  describe('[InstructorController.getQuestionsMyCourses] - 지식공유자가 만든 강의의 질문글 조회', () => {
    let query: InstructorQuestionQueryDto;

    beforeEach(() => {
      query = new InstructorQuestionQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(instructorService, 'getQuestionsByMyCourses')
        .mockResolvedValue(expectedQuestionByInstructor);

      const result = await instructorController.getQuestionsMyCourses(
        query,
        user,
      );

      expect(result).toEqual(expectedQuestionByInstructor);
      expect(instructorService.getQuestionsByMyCourses).toBeCalled();
      expect(instructorService.getQuestionsByMyCourses).toBeCalledWith(
        query,
        user,
      );
    });
  });

  describe('[InstructorController.getReviewsMyCourses] - 지식공유자가 만든 강의의 리뷰들 조회', () => {
    let query: InstructorReviewQueryDto;

    beforeEach(() => {
      query = new InstructorReviewQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(instructorService, 'getReviewsByMyCourses')
        .mockResolvedValue(expectedReviewByInstructor);

      const result = await instructorController.getReviewsMyCourses(
        query,
        user,
      );

      expect(result).toEqual(expectedReviewByInstructor);
      expect(instructorService.getReviewsByMyCourses).toBeCalled();
      expect(instructorService.getReviewsByMyCourses).toBeCalledWith(
        query,
        user,
      );
    });
  });

  describe('[InstructorController.registerInstructor] - 지식공유자 등록', () => {
    const mockResponse = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const createdResponse: IInstructorTokens = {
      access_token: 'access',
      refresh_token: 'refresh',
    };

    it('등록 성공', async () => {
      jest
        .spyOn(instructorService, 'create')
        .mockResolvedValue(createdResponse);

      const result = await instructorController.registerInstructor(
        mockCreateInstructorDto,
        user,
        mockResponse,
      );

      expect(result).toEqual(createdResponse);
      expect(instructorService.create).toBeCalled();
      expect(instructorService.create).toBeCalledWith(
        mockCreateInstructorDto,
        user,
        mockResponse,
      );
    });
  });
});
