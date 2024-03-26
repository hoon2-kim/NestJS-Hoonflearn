import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseUserService } from '@src/course_user/course-user.service';
import { ReviewService } from '@src/review/review.service';
import { Repository } from 'typeorm';
import { CreateReviewCommentDto } from '@src/review/review-comment/dtos/create-review-comment.dto';
import { UpdateReviewCommentDto } from '@src/review/review-comment/dtos/update-review-comment.dto';
import { ReviewCommentEntity } from '@src/review/review-comment/entities/review-comment.entity';

@Injectable()
export class ReviewCommentService {
  constructor(
    @InjectRepository(ReviewCommentEntity)
    private readonly reviewCommentRepository: Repository<ReviewCommentEntity>,

    private readonly reviewService: ReviewService,
    private readonly courseUserService: CourseUserService,
  ) {}

  async create(
    reviewId: string,
    createReviewCommentDto: CreateReviewCommentDto,
    userId: string,
  ): Promise<ReviewCommentEntity> {
    const { contents } = createReviewCommentDto;

    const review = await this.reviewService.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    // 강의 구매한 사람만 리뷰댓글
    await this.courseUserService.validateBoughtCourseByUser(
      userId,
      review?.fk_course_id,
    );

    const newComment = await this.reviewCommentRepository.save({
      contents,
      fk_user_id: userId,
      fk_review_id: reviewId,
    });

    return newComment;
  }

  async update(
    reviewId: string,
    commentId: string,
    updateReviewCommentDto: UpdateReviewCommentDto,
    userId: string,
  ): Promise<ReviewCommentEntity> {
    const review = await this.reviewService.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    const comment = await this.reviewCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('해당 리뷰댓글이 존재하지 않습니다.');
    }

    if (comment.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 수정이 가능합니다.');
    }

    Object.assign(comment, updateReviewCommentDto);

    return await this.reviewCommentRepository.save(comment);
  }

  async delete(
    reviewId: string,
    commentId: string,
    userId: string,
  ): Promise<void> {
    const review = await this.reviewService.findOneByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    const comment = await this.reviewCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('해당 리뷰댓글이 존재하지 않습니다.');
    }

    if (comment.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 삭제가 가능합니다.');
    }

    await this.reviewCommentRepository.delete({
      id: commentId,
    });
  }
}
