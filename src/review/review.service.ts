import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseService } from '@src/course/course.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { InstructorReviewQueryDto } from '@src/instructor/dtos/query/instructor.query.dto';
import { EInstructorReviewSortBy } from '@src/instructor/enums/instructor.enum';
import { ReviewLikeService } from '@src/review-like/review-like.service';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateReviewDto } from '@src/review/dtos/request/create-review.dto';
import { ReviewListQueryDto } from '@src/review/dtos/query/review-list.query.dto';
import { UpdateReviewDto } from '@src/review/dtos/request/update-review.dto';
import { ReviewEntity } from '@src/review/entities/review.entity';
import { EReviewMethod, EReviewSortBy } from '@src/review/enums/review.enum';
import {
  ReviewResponseWithCommentDto,
  ReviewResponseWithoutCommentDto,
} from '@src/review/dtos/response/review.response.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,

    private readonly courseService: CourseService,
    private readonly revivewLikeService: ReviewLikeService,
    private readonly courseUserService: CourseUserService,
  ) {}

  async findAllByCourse(
    courseId: string,
    reviewListQueryDto: ReviewListQueryDto,
  ): Promise<PageDto<ReviewResponseWithCommentDto>> {
    const { skip, take, sort } = reviewListQueryDto;

    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.course', 'course')
      .leftJoinAndSelect('review.reviewComments', 'comment')
      .take(take)
      .skip(skip);

    switch (sort) {
      case EReviewSortBy.Recent:
        query.orderBy('review.created_at', 'DESC');
        break;

      case EReviewSortBy.Like:
        query.orderBy('review.likeCount', 'DESC');
        query.addOrderBy('review.created_at', 'DESC');
        break;

      case EReviewSortBy.HighRating:
        query.orderBy('review.rating', 'DESC');
        query.addOrderBy('review.created_at', 'DESC');
        break;

      case EReviewSortBy.LowRating:
        query.orderBy('review.rating', 'ASC');
        query.addOrderBy('review.created_at', 'DESC');
        break;

      default:
        query.orderBy('review.created_at', 'DESC');
        break;
    }

    const [reviews, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: reviewListQueryDto,
      itemCount: count,
    });

    return new PageDto(
      reviews.map((r) => ReviewResponseWithCommentDto.from(r)),
      pageMeta,
    );
  }

  async findOneByOptions(
    options: FindOneOptions<ReviewEntity>,
  ): Promise<ReviewEntity | null> {
    const review: ReviewEntity | null = await this.reviewRepository.findOne(
      options,
    );

    return review;
  }

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<ReviewEntity> {
    const { courseId, rating, contents } = createReviewDto;

    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const isAlreadyReview = await this.findOneByOptions({
      where: {
        fk_course_id: courseId,
        fk_user_id: userId,
      },
    });

    if (isAlreadyReview) {
      throw new BadRequestException('이미 리뷰를 작성하셨습니다.');
    }

    // 강의 구매 했는지
    await this.courseUserService.validateBoughtCourseByUser(userId, courseId);

    return await this.reviewRepository.manager.transaction(async (manager) => {
      // 별점
      const prevReviewCount = course.reviewCount;
      const averageCal =
        (course.averageRating * prevReviewCount + rating) /
        (prevReviewCount + 1);

      await this.courseService.courseReviewRatingUpdate(
        course,
        averageCal,
        EReviewMethod.Create,
        manager,
      );

      const result = await manager.save(ReviewEntity, {
        contents,
        rating,
        fk_course_id: courseId,
        fk_user_id: userId,
      });

      return result;
    });
  }

  async update(
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<void> {
    const { rating } = updateReviewDto;

    const review = await this.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    if (review.fk_user_id !== userId) {
      throw new ForbiddenException('리뷰를 작성한 본인이 아닙니다.');
    }

    if (rating) {
      const course = await this.courseService.findOneByOptions({
        where: { id: review.fk_course_id },
      });

      const newAverage =
        course.averageRating * course.reviewCount -
        review.rating +
        rating / course.reviewCount;

      await this.courseService.courseReviewRatingUpdate(
        course,
        newAverage,
        EReviewMethod.Update,
      );
    }

    Object.assign(review, updateReviewDto);

    await this.reviewRepository.save(review);
  }

  async delete(reviewId: string, userId: string): Promise<boolean> {
    const review = await this.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    if (review.fk_user_id !== userId) {
      throw new ForbiddenException('리뷰를 작성한 본인이 아닙니다.');
    }

    const course = await this.courseService.findOneByOptions({
      where: { id: review.fk_course_id },
    });

    return await this.reviewRepository.manager.transaction(async (manager) => {
      const newAverage =
        (course.averageRating * course.reviewCount - review.rating) /
          course.reviewCount -
        1;

      await this.courseService.courseReviewRatingUpdate(
        course,
        newAverage,
        EReviewMethod.Delete,
        manager,
      );

      const result = await manager.delete(ReviewEntity, { id: reviewId });

      return result.affected ? true : false;
    });
  }

  async addOrCancelLike(reviewId: string, userId: string): Promise<void> {
    const [reviewLiked, review] = await Promise.all([
      this.isLikeByUser(reviewId, userId),
      this.findOneByOptions({ where: { id: reviewId } }),
    ]);

    if (!review) {
      throw new NotFoundException('해당 리뷰글이 존재하지 않습니다.');
    }

    await this.revivewLikeService.toggleReviewLikeStatus(
      reviewId,
      userId,
      reviewLiked,
    );
  }

  private async isLikeByUser(
    reviewId: string,
    userId: string,
  ): Promise<boolean> {
    const isLike = await this.revivewLikeService.findOneByOptions({
      where: {
        fk_review_id: reviewId,
        fk_user_id: userId,
      },
    });

    if (isLike) {
      return true;
    }

    return false;
  }

  async findReviewsByInstructorCourse(
    courseIds: string[],
    instructorReviewQueryDto: InstructorReviewQueryDto,
    userId: string,
  ): Promise<PageDto<ReviewResponseWithoutCommentDto>> {
    const { courseId, sort, skip, take } = instructorReviewQueryDto;

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.course', 'course')
      .leftJoinAndSelect('review.user', 'user')
      .take(take)
      .skip(skip);

    if (courseIds.length > 0) {
      query.where('review.fk_course_id IN (:...courseIds)', { courseIds });
    } else if (courseIds.length === 0) {
      query.where('1 = 0');
    }

    if (courseId) {
      query.andWhere('review.fk_course_id = :courseId', { courseId });
    }

    switch (sort) {
      case EInstructorReviewSortBy.Recent:
        query.orderBy('review.created_at', 'DESC');
        break;

      case EInstructorReviewSortBy.Like:
        query
          .orderBy('review.likeCount', 'DESC')
          .addOrderBy('review.created_at', 'DESC');
        break;

      case EInstructorReviewSortBy.Comment_Recent:
        query
          .leftJoin(
            'review.reviewComments',
            'comment',
            'comment.created_at =(SELECT MAX(created_at) FROM reviews_comments WHERE fk_review_id = review.id',
          )
          .andWhere('comment.fk_user_id = :userId', { userId })
          .orderBy('comment.created_at', 'DESC');
        break;

      case EInstructorReviewSortBy.NotComment:
        query
          .leftJoin('review.reviewComments', 'comment')
          .andWhere('comment.fk_user_id != :userId', { userId });
        break;

      default:
        query.orderBy('review.created_at', 'DESC');
        break;
    }

    const [reviews, count] = await query.getManyAndCount();

    const pageMeta = new PageMetaDto({
      pageOptionDto: instructorReviewQueryDto,
      itemCount: count,
    });

    return new PageDto(
      reviews.map((r) => ReviewResponseWithoutCommentDto.from(r)),
      pageMeta,
    );
  }
}
