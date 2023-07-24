import { Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { Patch } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AtGuard } from 'src/auth/guard/at.guard';
import { CreateReviewCommentDto } from './dto/create-review-comment.dto';
import { UpdateReviewCommentDto } from './dto/update-review-comment.dto';
import { ReviewCommentService } from './review-comment.service';

@Controller('reviews/comments')
export class ReviewCommentController {
  constructor(private readonly reviewCommentService: ReviewCommentService) {}

  @Post()
  @UseGuards(AtGuard)
  createReviewComment(
    @Body() createReviewCommentDto: CreateReviewCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewCommentService.create(createReviewCommentDto, userId);
  }

  @Patch('/:commentId')
  @UseGuards(AtGuard)
  updateReviewCommet(
    @Param('commentId') commentId: string,
    @Body() updateReviewCommentDto: UpdateReviewCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewCommentService.update(
      commentId,
      updateReviewCommentDto,
      userId,
    );
  }

  @Delete('/:commentId')
  @UseGuards(AtGuard)
  deleteReviewCommet(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewCommentService.delete(commentId, userId);
  }
}
