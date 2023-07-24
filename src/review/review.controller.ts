import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/auth/guard/at.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/courses/:courseId')
  findAllReviewsByCourse(
    @Param('courseId') courseId: string, //
  ) {
    return this.reviewService.findAllByCourse(courseId);
  }

  @Post()
  @UseGuards(AtGuard)
  createReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.reviewService.create(createReviewDto, user);
  }

  @Patch('/:reviewId')
  @UseGuards(AtGuard)
  updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.reviewService.update(reviewId, updateReviewDto, user);
  }

  @Delete('/:reviewId')
  @UseGuards(AtGuard)
  deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.reviewService.delete(reviewId, user);
  }
}
