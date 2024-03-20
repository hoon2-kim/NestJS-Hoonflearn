import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewService } from '@src/review/review.service';
import { CreateReviewDto } from '@src/review/dtos/create-review.dto';
import { UpdateReviewDto } from '@src/review/dtos/update-review.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { ReviewListQueryDto } from '@src/review/dtos/review-list.query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateReviewSwagger,
  ApiDeleteReviewSwagger,
  ApiGetAllReviewsByCourseSwagger,
  ApiLikeReviewSwagger,
  ApiUpdateReviewSwagger,
} from './review.swagger';
import { PageDto } from '@src/common/dtos/page.dto';
import { ReviewEntity } from '@src/review/entities/review.entity';

@ApiTags('REVIEW')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiGetAllReviewsByCourseSwagger('해당 강의의 모든 리뷰 조회')
  @Get('/courses/:courseId')
  async findAllReviewsByCourse(
    @Param('courseId') courseId: string, //
    @Query() reviewListQueryDto: ReviewListQueryDto,
  ): Promise<PageDto<ReviewEntity>> {
    return await this.reviewService.findAllByCourse(
      courseId,
      reviewListQueryDto,
    );
  }

  @ApiCreateReviewSwagger('리뷰 작성(강의를 구매한 사람만)')
  @Post()
  @UseGuards(AtGuard)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser('id') userId: string,
  ): Promise<ReviewEntity> {
    return await this.reviewService.create(createReviewDto, userId);
  }

  @ApiLikeReviewSwagger('리뷰 좋아요 / 좋아요 취소')
  @Post('/:reviewId/like')
  @UseGuards(AtGuard)
  async addOrCancelReviewLike(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.reviewService.addOrCancelLike(reviewId, userId);
  }

  @ApiUpdateReviewSwagger('리뷰 수정')
  @Patch('/:reviewId')
  @UseGuards(AtGuard)
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser('id') userId: string,
  ): Promise<ReviewEntity> {
    return await this.reviewService.update(reviewId, updateReviewDto, userId);
  }

  @ApiDeleteReviewSwagger('리뷰 삭제')
  @Delete('/:reviewId')
  @UseGuards(AtGuard)
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.reviewService.delete(reviewId, userId);
  }
}
