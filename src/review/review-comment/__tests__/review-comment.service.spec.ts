import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseUserService } from '@src/course_user/course-user.service';
import { ReviewCommentService } from '@src/review/review-comment/review-comment.service';
import { ReviewService } from '@src/review/review.service';
import { Repository } from 'typeorm';
import { ReviewCommentEntity } from '@src/review/review-comment/entities/review-comment.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mockReviewCommentRepository } from '@test/__mocks__/mock-repository';
import {
  mockCreateReviewCommentDto,
  mockReview,
  mockReviewComment,
  mockUpdateReviewCommentDto,
} from '@test/__mocks__/mock-data';
import {
  mockReviewService,
  mockCourseUserService,
} from '@test/__mocks__/mock-service';

describe('ReviewCommentService', () => {
  let reviewCommentService: ReviewCommentService;
  let reviewCommentRepository: Repository<ReviewCommentEntity>;
  let reviewService: ReviewService;
  let courseUserService: CourseUserService;

  const reviewId = 'uuid';
  const userId = 'uuid';
  const commentId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewCommentService,
        {
          provide: getRepositoryToken(ReviewCommentEntity),
          useValue: mockReviewCommentRepository,
        },
        { provide: ReviewService, useValue: mockReviewService },
        { provide: CourseUserService, useValue: mockCourseUserService },
      ],
    }).compile();

    reviewCommentService =
      module.get<ReviewCommentService>(ReviewCommentService);
    reviewCommentRepository = module.get<Repository<ReviewCommentEntity>>(
      getRepositoryToken(ReviewCommentEntity),
    );
    reviewService = module.get<ReviewService>(ReviewService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reviewCommentService).toBeDefined();
    expect(reviewCommentRepository).toBeDefined();
    expect(reviewService).toBeDefined();
    expect(courseUserService).toBeDefined();
  });

  describe('[리뷰 댓글 생성]', () => {
    it('리뷰 댓글 생성 성공', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockResolvedValue(undefined);
      jest
        .spyOn(reviewCommentRepository, 'save')
        .mockResolvedValue(mockReviewComment);

      const result = await reviewCommentService.create(
        reviewId,
        mockCreateReviewCommentDto,
        userId,
      );

      expect(result).toEqual(mockReviewComment);
      expect(reviewService.findOneByOptions).toBeCalled();
      expect(courseUserService.validateBoughtCourseByUser).toBeCalled();
    });

    it('리뷰 댓글 생성 실패 - 해당 리뷰가 없는 경우(404에러)', async () => {
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewCommentService.create(
          reviewId,
          mockCreateReviewCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 댓글 생성 실패 - 강의를 구매하지 않은 경우(403에러)', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockRejectedValue(
          new ForbiddenException('해당 강의를 구매하지 않으셨습니다.'),
        );

      try {
        await reviewCommentService.create(
          reviewId,
          mockCreateReviewCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[리뷰 댓글 수정]', () => {
    it('리뷰 댓글 수정 성공', async () => {
      const mockUpdateReviewComment = Object.assign(
        mockReviewComment,
        mockUpdateReviewCommentDto,
      );

      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);
      jest
        .spyOn(reviewCommentRepository, 'findOne')
        .mockResolvedValue(mockReviewComment);
      jest
        .spyOn(reviewCommentRepository, 'save')
        .mockResolvedValue(mockUpdateReviewComment);

      const result = await reviewCommentService.update(
        reviewId,
        commentId,
        mockUpdateReviewCommentDto,
        userId,
      );

      expect(result).toEqual(mockUpdateReviewComment);
      expect(reviewService.findOneByOptions).toBeCalled();
      expect(reviewCommentRepository.findOne).toBeCalled();
    });

    it('리뷰 댓글 수정 실패 - 리뷰가 없는 경우(404에러)', async () => {
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewCommentService.update(
          reviewId,
          commentId,
          mockUpdateReviewCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 댓글 수정 실패 - 해당 리뷰댓글이 없는 경우(404에러)', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);
      jest.spyOn(reviewCommentRepository, 'findOne').mockResolvedValue(null);

      try {
        await reviewCommentService.update(
          reviewId,
          commentId,
          mockUpdateReviewCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 댓글 수정 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);
      jest.spyOn(reviewCommentRepository, 'findOne').mockResolvedValue({
        ...mockReviewComment,
        fk_user_id: 'anotherUserId',
      });

      try {
        await reviewCommentService.update(
          reviewId,
          commentId,
          mockUpdateReviewCommentDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[리뷰 댓글 삭제]', () => {
    it('리뷰 댓글 삭제 성공', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);
      jest
        .spyOn(reviewCommentRepository, 'findOne')
        .mockResolvedValue(mockReviewComment);
      jest
        .spyOn(reviewCommentRepository, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await reviewCommentService.delete(
        reviewId,
        commentId,
        userId,
      );

      expect(result).toBeUndefined();
      expect(reviewService.findOneByOptions).toBeCalled();
      expect(reviewCommentRepository.findOne).toBeCalled();
      expect(reviewCommentRepository.delete).toBeCalled();
    });

    it('리뷰 댓글 삭제 실패 - 리뷰가 없는 경우(404에러)', async () => {
      jest.spyOn(reviewService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await reviewCommentService.delete(reviewId, commentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 댓글 삭제 실패 - 해당 리뷰댓글이 없는 경우(404에러)', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);
      jest.spyOn(reviewCommentRepository, 'findOne').mockResolvedValue(null);

      try {
        await reviewCommentService.delete(reviewId, commentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('리뷰 댓글 삭제 실패 - 본인이 아닌 경우(403에러)', async () => {
      jest
        .spyOn(reviewService, 'findOneByOptions')
        .mockResolvedValue(mockReview);

      jest.spyOn(reviewCommentRepository, 'findOne').mockResolvedValue({
        ...mockReviewComment,
        fk_user_id: 'anotherUserId',
      });

      try {
        await reviewCommentService.delete(reviewId, commentId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
