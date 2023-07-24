import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewService } from 'src/review/review.service';
import { Repository } from 'typeorm';
import { CreateReviewCommentDto } from './dto/create-review-comment.dto';
import { UpdateReviewCommentDto } from './dto/update-review-comment.dto';
import { ReviewCommentEntity } from './entities/review-comment.entity';

@Injectable()
export class ReviewCommentService {
  constructor(
    @InjectRepository(ReviewCommentEntity)
    private readonly reviewCommentRepository: Repository<ReviewCommentEntity>,

    private readonly reviewService: ReviewService,
  ) {}

  async create(
    createReviewCommentDto: CreateReviewCommentDto,
    userId: string,
  ): Promise<ReviewCommentEntity> {
    const { reviewId, contents } = createReviewCommentDto;

    const review = await this.reviewService.findByOptions({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('해당 리뷰가 존재하지 않습니다.');
    }

    // TODO : 강의 구매한 사람만 리뷰댓글

    const newComment = await this.reviewCommentRepository.save({
      contents,
      fk_user_id: userId,
      fk_review_id: reviewId,
    });

    return newComment;
  }

  async update(
    commentId: string,
    updateReviewCommentDto: UpdateReviewCommentDto,
    userId: string,
  ) {
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

  async delete(commentId: string, userId: string) {
    const comment = await this.reviewCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('해당 리뷰댓글이 존재하지 않습니다.');
    }

    if (comment.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 삭제가 가능합니다.');
    }

    const result = await this.reviewCommentRepository.delete({
      id: commentId,
    });

    return result.affected ? true : false;
  }
}
