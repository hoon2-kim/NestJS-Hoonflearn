import { Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { Patch } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CreateReviewCommentDto } from '@src/review/review-comment/dtos/create-review-comment.dto';
import { UpdateReviewCommentDto } from '@src/review/review-comment/dtos/update-review-comment.dto';
import { ReviewCommentEntity } from '@src/review/review-comment/entities/review-comment.entity';
import { ReviewCommentService } from '@src/review/review-comment/review-comment.service';
import {
  ApiCreateReviewCommentSwagger,
  ApiDeleteReviewCommentSwagger,
  ApiUpdateReviewCommentSwagger,
} from '@src/review/review-comment/review-comment.swagger';

@ApiTags('REVIEW-COMMENT')
@UseGuards(AtGuard)
@Controller('reviews/:reviewId/comments')
export class ReviewCommentController {
  constructor(private readonly reviewCommentService: ReviewCommentService) {}

  @ApiCreateReviewCommentSwagger('리뷰 댓글 생성(강의를 구매한 사람만 가능)')
  @Post()
  async createReviewComment(
    @Param('reviewId') reviewId: string,
    @Body() createReviewCommentDto: CreateReviewCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<ReviewCommentEntity> {
    return await this.reviewCommentService.create(
      reviewId,
      createReviewCommentDto,
      userId,
    );
  }

  @ApiUpdateReviewCommentSwagger('리뷰 댓글 수정')
  @Patch('/:commentId')
  async updateReviewCommet(
    @Param('reviewId') reviewId: string,
    @Param('commentId') commentId: string,
    @Body() updateReviewCommentDto: UpdateReviewCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<ReviewCommentEntity> {
    return await this.reviewCommentService.update(
      reviewId,
      commentId,
      updateReviewCommentDto,
      userId,
    );
  }

  @ApiDeleteReviewCommentSwagger('리뷰 댓글 삭제')
  @Delete('/:commentId')
  async deleteReviewCommet(
    @Param('reviewId') reviewId: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.reviewCommentService.delete(reviewId, commentId, userId);
  }
}
