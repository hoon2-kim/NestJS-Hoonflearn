import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from '@src/course/course.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { ReviewLikeService } from '@src/review-like/review-like.service';
import { ReviewService } from '@src/review/review.service';
import { DataSource, Repository } from 'typeorm';
import { ReviewEntity } from '@src/review/entities/review.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  expectedReviewByInstructor,
  expectedReviewsByCourse,
  mockCourseService,
  mockCourseUserService,
  mockCreatedReview,
  mockCreateReviewDto,
  mockReviewLikeService,
  mockReviewRepository,
  mockReviewWithoutComment,
  mockUpdateReviewDto,
} from '@test/__mocks__/review.mock';
import { ReviewListQueryDto } from '@src/review/dtos/query/review-list.query.dto';
import { mockCreatedCourse } from '@test/__mocks__/course.mock';
import { mockReviewWithComment } from '@test/__mocks__/review.mock';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EReviewSortBy } from '../enums/review.enum';
import { mockReviewLike } from '@test/__mocks__/reviewLike.mock';
import { InstructorReviewQueryDto } from '@src/instructor/dtos/query/instructor.query.dto';
import { EInstructorReviewSortBy } from '@src/instructor/enums/instructor.enum';

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let reviewRepository: Repository<ReviewEntity>;
  let courseService: CourseService;
  let reviewLikeService: ReviewLikeService;
  let courseUserService: CourseUserService;
  let dataSource: DataSource;

  const mockDataSource = {
    transaction: jest.fn(),
  };
  const courseId = 'uuid';
  const userId = 'uuid';
  const reviewId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(ReviewEntity),
          useValue: mockReviewRepository,
        },
        { provide: CourseService, useValue: mockCourseService },
        { provide: ReviewLikeService, useValue: mockReviewLikeService },
        { provide: CourseUserService, useValue: mockCourseUserService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    reviewService = module.get<ReviewService>(ReviewService);
    reviewRepository = module.get<Repository<ReviewEntity>>(
      getRepositoryToken(ReviewEntity),
    );
    courseService = module.get<CourseService>(CourseService);
    reviewLikeService = module.get<ReviewLikeService>(ReviewLikeService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reviewService).toBeDefined();
    expect(reviewRepository).toBeDefined();
    expect(courseService).toBeDefined();
    expect(reviewLikeService).toBeDefined();
    expect(courseUserService).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('[강의의 모든 리뷰들 조회]', () => {
    let query: ReviewListQueryDto;

    beforeEach(() => {
      query = new ReviewListQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(reviewRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockReviewWithComment);

      const result = await reviewService.findAllByCourse(courseId, query);

      expect(result).toEqual(expectedReviewsByCourse);
      expect(
        reviewRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(3);
      expect(reviewRepository.createQueryBuilder().leftJoin).toBeCalledTimes(1);
      expect(reviewRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(reviewRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(reviewRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledTimes(1);
      expect(
        reviewRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('조회 성공 - 검색 필터 호출 테스트(최신순)', async () => {
      query.sort = EReviewSortBy.Recent;

      await reviewService.findAllByCourse(courseId, query);

      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'review.created_at',
        'DESC',
      );
    });

    it('조회 성공 - 검색 필터 호출 테스트(좋아요순)', async () => {
      query.sort = EReviewSortBy.Like;

      await reviewService.findAllByCourse(courseId, query);

      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'review.likeCount',
        'DESC',
      );
      expect(reviewRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'review.created_at',
        'DESC',
      );
    });

    it('조회 성공 - 검색 필터 호출 테스트(리뷰점수높은순)', async () => {
      query.sort = EReviewSortBy.HighRating;

      await reviewService.findAllByCourse(courseId, query);

      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'review.rating',
        'DESC',
      );
      expect(reviewRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'review.created_at',
        'DESC',
      );
    });

    it('조회 성공 - 검색 필터 호출 테스트(리뷰점수낮은순)', async () => {
      query.sort = EReviewSortBy.LowRating;

      await reviewService.findAllByCourse(courseId, query);

      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'review.rating',
        'ASC',
      );
      expect(reviewRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'review.created_at',
        'DESC',
      );
    });

    it('조회 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewService.findAllByCourse(courseId, query);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[리뷰 생성]', () => {
    const mockSave = jest.fn().mockResolvedValue(mockCreatedReview);

    it('리뷰 생성 성공', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockResolvedValue(undefined);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        jest
          .spyOn(courseService, 'courseReviewRatingUpdate')
          .mockResolvedValue(undefined);

        return await cb({ save: mockSave });
      });

      const result = await reviewService.create(mockCreateReviewDto, userId);

      expect(result).toEqual(mockCreatedReview);
      expect(courseService.findOneByOptions).toBeCalled();
      expect(reviewService.findOneByOptions).toBeCalled();
      expect(courseUserService.validateBoughtCourseByUser).toBeCalled();
      expect(courseService.courseReviewRatingUpdate).toBeCalled();
    });

    it('리뷰 생성 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewService.create(mockCreateReviewDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 생성 실패 - 이미 리뷰를 작성한 경우(400에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedReview);

      try {
        await reviewService.create(mockCreateReviewDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('리뷰 생성 실패 - 강의를 구매 안한 경우(403에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 구매하지 않으셨습니다.'),
        );

      try {
        await reviewService.create(mockCreateReviewDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[리뷰 수정]', () => {
    const upadteResult = { message: '수정 성공' };
    it('리뷰 수정 성공 - 내용만 수정', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedReview);
      jest.spyOn(reviewRepository, 'save').mockResolvedValue(mockCreatedReview);

      const result = await reviewService.update(
        reviewId,
        mockUpdateReviewDto,
        userId,
      );

      expect(result).toEqual(upadteResult);
      expect(courseService.courseReviewRatingUpdate).not.toBeCalled();
    });

    it('리뷰 수정 성공 - 평점도 수정', async () => {
      const mockUpdateReviewDto2 = { ...mockUpdateReviewDto, rating: 1 };
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedReview);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(courseService, 'courseReviewRatingUpdate')
        .mockResolvedValue(undefined);
      jest.spyOn(reviewRepository, 'save').mockResolvedValue(mockCreatedReview);

      const result = await reviewService.update(
        reviewId,
        mockUpdateReviewDto2,
        userId,
      );

      expect(result).toEqual(upadteResult);
      expect(courseService.courseReviewRatingUpdate).toBeCalled();
    });

    it('리뷰 수정 실패 - 해당 리뷰가 없는 경우(404에러)', async () => {
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewService.update(reviewId, mockUpdateReviewDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 수정 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockRejectedValue(
          new ForbiddenException('리뷰를 작성한 본인이 아닙니다.'),
        );

      try {
        await reviewService.update(reviewId, mockUpdateReviewDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[리뷰 삭제]', () => {
    const mockDelete = jest.fn().mockResolvedValue({ affected: 1 });

    it('리뷰 삭제 성공', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedReview);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        jest
          .spyOn(courseService, 'courseReviewRatingUpdate')
          .mockResolvedValue(undefined);

        return await cb({ delete: mockDelete });
      });

      const result = await reviewService.delete(reviewId, userId);

      expect(result).toBe(true);
      expect(courseService.courseReviewRatingUpdate).toBeCalled();
    });

    it('리뷰 삭제 실패 - 해당 리뷰가 없는 경우(404에러)', async () => {
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewService.delete(reviewId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 삭제 실패 - 리뷰 작성 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockRejectedValue(
          new ForbiddenException('리뷰를 작성한 본인이 아닙니다.'),
        );

      try {
        await reviewService.delete(reviewId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[리뷰 좋아요 및 취소]', () => {
    it('좋아요 성공', async () => {
      jest.spyOn(reviewService, 'isLikeByUser').mockResolvedValue(false);
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedReview);
      jest
        .spyOn(reviewLikeService, 'toggleReviewLikeStatus')
        .mockResolvedValue(undefined);

      const result = await reviewService.addOrCancelLike(reviewId, userId);

      expect(result).toBeUndefined();
      expect(reviewLikeService.toggleReviewLikeStatus).toBeCalled();
    });

    it('좋아요 취소 성공', async () => {
      jest.spyOn(reviewService, 'isLikeByUser').mockResolvedValue(true);
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedReview);
      jest
        .spyOn(reviewLikeService, 'toggleReviewLikeStatus')
        .mockResolvedValue(undefined);

      const result = await reviewService.addOrCancelLike(reviewId, userId);

      expect(result).toBeUndefined();
      expect(reviewLikeService.toggleReviewLikeStatus).toBeCalled();
    });

    it('좋아요 또는 취소 실패 - 리뷰가 없는 경우(404에러)', async () => {
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewService.delete(reviewId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('isLikeByUser(유저가 좋아요 누른지 여부 boolean값 반환) 테스트', () => {
    it('좋아요 하는 경우 false 반환', async () => {
      jest.spyOn(reviewLikeService, 'findOneByOptions').mockResolvedValue(null);

      const result = await reviewService.isLikeByUser(reviewId, userId);

      expect(result).toBe(false);
    });

    it('좋아요 취소 하는 경우 true 반환', async () => {
      jest
        .spyOn(reviewLikeService, 'findOneByOptions')
        .mockResolvedValue(mockReviewLike);

      const result = await reviewService.isLikeByUser(reviewId, userId);

      expect(result).toBe(true);
    });
  });

  describe('findReviewsByInstructorCourse(지식공유자가 만든 강의의 리뷰 찾는 로직)테스트', () => {
    let query: InstructorReviewQueryDto;
    const courseIds = ['uuid1', 'uuid2'];

    beforeEach(() => {
      query = new InstructorReviewQueryDto();
    });

    it('검색필터 없이 그냥 조회', async () => {
      jest
        .spyOn(reviewRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockReviewWithoutComment);

      const result = await reviewService.findReviewsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(result).toEqual(expectedReviewByInstructor);
      expect(
        reviewRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(2);
      expect(reviewRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(reviewRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledTimes(1);
    });

    it('courseIds가 있는 경우 호출 확인', async () => {
      await reviewService.findReviewsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(reviewRepository.createQueryBuilder().where).toBeCalledWith(
        'review.fk_course_id IN (:...courseIds)',
        { courseIds },
      );
    });

    it('courseIds가 없는 경우 빈 배열 반환', async () => {
      const emptyCourseIds = [];
      jest
        .spyOn(reviewRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue([[], 0]);

      const result = await reviewService.findReviewsByInstructorCourse(
        emptyCourseIds,
        query,
        userId,
      );

      expect(reviewRepository.createQueryBuilder().where).toBeCalledWith(
        '1 = 0',
      );
      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          take: 15,
          itemCount: 0,
          pageCount: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('검색필터 호출 확인 - 강의별 확인', async () => {
      query.courseId = 'uuid';

      await reviewService.findReviewsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(reviewRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(reviewRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'review.fk_course_id = :courseId',
        { courseId },
      );
    });

    it('검색필터 호출 확인 - 최신순', async () => {
      query.sort = EInstructorReviewSortBy.Recent;

      await reviewService.findReviewsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'review.created_at',
        'DESC',
      );
    });

    it('검색필터 호출 확인 - 리뷰좋아요순', async () => {
      query.sort = EInstructorReviewSortBy.Like;

      await reviewService.findReviewsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(reviewRepository.createQueryBuilder().addOrderBy).toBeCalled();
      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'review.likeCount',
        'DESC',
      );
      expect(reviewRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'review.created_at',
        'DESC',
      );
    });

    it('검색필터 호출 확인 - 최근답변순서', async () => {
      query.sort = EInstructorReviewSortBy.Comment_Recent;

      await reviewService.findReviewsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(reviewRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'comment.created_at',
        'DESC',
      );
      expect(reviewRepository.createQueryBuilder().leftJoin).toBeCalled();
      expect(reviewRepository.createQueryBuilder().leftJoin).toBeCalledWith(
        'review.reviewComments',
        'comment',
        'comment.created_at =(SELECT MAX(created_at) FROM reviews_comments WHERE fk_review_id = review.id',
      );
      expect(reviewRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(reviewRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'comment.fk_user_id = :userId',
        { userId },
      );
    });

    it('검색필터 호출 확인 - 미답변순', async () => {
      query.sort = EInstructorReviewSortBy.NotComment;

      await reviewService.findReviewsByInstructorCourse(
        courseIds,
        query,
        userId,
      );

      expect(reviewRepository.createQueryBuilder().leftJoin).toBeCalled();
      expect(reviewRepository.createQueryBuilder().leftJoin).toBeCalledWith(
        'review.reviewComments',
        'comment',
      );
      expect(reviewRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(reviewRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'comment.fk_user_id != :userId',
        { userId },
      );
    });
  });
});
