import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseService } from 'src/course/course.service';
import { ReviewLikeService } from 'src/review-like/review-like.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewEntity } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,

    private readonly courseService: CourseService,
    private readonly revivewLikeService: ReviewLikeService,
  ) {}

  async findAllByCourse(courseId: string) {
    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const review = await this.reviewRepository.find({
      where: { fk_course_id: courseId },
    });

    return review;
  }

  async findOneByOptions(options: FindOneOptions<ReviewEntity>) {
    const review: ReviewEntity | null = await this.reviewRepository.findOne(
      options,
    );

    return review;
  }

  async create(createReviewDto: CreateReviewDto, user: UserEntity) {
    // 트랜잭션 해야할까(나중에 동시성 테스트 해보자)
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
        fk_user_id: user.id,
      },
    });

    if (isAlreadyReview) {
      throw new BadRequestException('이미 리뷰를 작성하셨습니다.');
    }

    // 강의 구매 했는지

    // 별점
    const prevReviewCount = course.reviewCount;
    const averageCal =
      (course.averageRating * prevReviewCount + rating) / (prevReviewCount + 1);

    await this.courseService.courseReviewRatingUpdate(course, averageCal);

    const result = await this.reviewRepository.save({
      contents,
      rating,
      fk_course_id: courseId,
      fk_user_id: user.id,
    });

    return result;
  }

  async addLike(reviewId: string, userId: string) {
    const review = await this.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰글이 존재하지 않습니다.');
    }

    const isLike = await this.revivewLikeService.findOneByOptions({
      where: {
        fk_review_id: reviewId,
        fk_user_id: userId,
      },
    });

    if (!isLike) {
      await this.revivewLikeService.addReviewLike(reviewId, userId);
      await this.reviewRepository.update(
        { id: reviewId },
        { likeCount: review.likeCount + 1 },
      );
    } else {
      return;
    }
  }

  async update(
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
    user: UserEntity,
  ) {
    const { rating } = updateReviewDto;

    const review = await this.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    if (review.fk_user_id !== user.id) {
      throw new ForbiddenException('리뷰를 작성한 본인이 아닙니다.');
    }

    if (rating) {
      const course = await this.courseService.findOneByOptions({
        where: { id: review.fk_course_id },
        // 최적화를 위해 select 할까?
      });

      const newAverage =
        course.averageRating * course.reviewCount -
        review.rating +
        rating / course.reviewCount;

      await this.courseService.courseReviewRatingUpdate(course, newAverage);
    }

    Object.assign(review, updateReviewDto);

    return await this.reviewRepository.save(review);
  }

  async delete(reviewId: string, user: UserEntity) {
    const review = await this.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    if (review.fk_user_id !== user.id) {
      throw new ForbiddenException('리뷰를 작성한 본인이 아닙니다.');
    }

    const course = await this.courseService.findOneByOptions({
      where: { id: review.fk_course_id },
    });

    const newAverage =
      (course.averageRating * course.reviewCount - review.rating) /
        course.reviewCount -
      1;

    await this.courseService.courseReviewRatingUpdate(course, newAverage);

    const result = await this.reviewRepository.delete({ id: reviewId });

    return result.affected ? true : false;
  }

  async cancelLike(reviewId: string, userId: string) {
    const review = await this.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰글이 존재하지 않습니다.');
    }

    const isLike = await this.revivewLikeService.findOneByOptions({
      where: {
        fk_review_id: reviewId,
        fk_user_id: userId,
      },
    });

    if (isLike) {
      await this.revivewLikeService.cancelReviewLike(reviewId, userId);
      await this.reviewRepository.update(
        { id: reviewId },
        { likeCount: review.likeCount - 1 },
      );
    } else {
      return;
    }
  }
}
