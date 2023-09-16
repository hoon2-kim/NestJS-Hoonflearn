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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dtos/request/create-review.dto';
import { UpdateReviewDto } from './dtos/request/update-review.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ReviewListQueryDto } from './dtos/query/review-list.query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateReviewSwagger,
  ApiDeleteReviewSwagger,
  ApiGetAllReviewsByCourseSwagger,
  ApiLikeReviewSwagger,
  ApiUpdateReviewSwagger,
} from './review.swagger';
import { PageDto } from 'src/common/dtos/page.dto';
import { ReviewResponseWithCommentDto } from './dtos/response/review.response.dto';
import { ReviewEntity } from './entities/review.entity';

@ApiTags('REVIEW')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiGetAllReviewsByCourseSwagger('해당 강의의 모든 리뷰 조회')
  @Get('/courses/:courseId')
  findAllReviewsByCourse(
    @Param('courseId') courseId: string, //
    @Query() reviewListQueryDto: ReviewListQueryDto,
  ): Promise<PageDto<ReviewResponseWithCommentDto>> {
    return this.reviewService.findAllByCourse(courseId, reviewListQueryDto);
  }

  @ApiCreateReviewSwagger('리뷰 작성(강의를 구매한 사람만)')
  @Post()
  @UseGuards(AtGuard)
  createReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser('id') userId: string,
  ): Promise<ReviewEntity> {
    return this.reviewService.create(createReviewDto, userId);
  }

  @ApiLikeReviewSwagger('리뷰 좋아요 / 좋아요 취소')
  @Post('/:reviewId/like')
  @UseGuards(AtGuard)
  addOrCancelReviewLike(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.reviewService.addOrCancelLike(reviewId, userId);
  }

  @ApiUpdateReviewSwagger('리뷰 수정')
  @Patch('/:reviewId')
  @UseGuards(AtGuard)
  updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.reviewService.update(reviewId, updateReviewDto, userId);
  }

  @ApiDeleteReviewSwagger('리뷰 삭제')
  @Delete('/:reviewId')
  @UseGuards(AtGuard)
  deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.reviewService.delete(reviewId, userId);
  }
}
