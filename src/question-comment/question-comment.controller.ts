import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { QuestionCommentService } from './question-comment.service';
import { UpdateQuestionCommentDto } from './dtos/request/update-question-comment.dto';
import { CreateQuestionCommentDto } from './dtos/request/create-question-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateQuestionCommentSwagger,
  ApiDeleteQuestionCommentSwagger,
  ApiUpdateQuestionCommentSwagger,
} from './question-comment.swagger';
import { QuestionCommentEntity } from './entities/question-comment.entity';

@ApiTags('QUESTION-COMMENT')
@UseGuards(AtGuard)
@Controller('questions/:questionId/comments')
export class QuestionCommentController {
  constructor(
    private readonly questionCommentService: QuestionCommentService,
  ) {}

  @ApiCreateQuestionCommentSwagger('질문글 댓글 생성')
  @Post()
  createQuestionComment(
    @Param('questionId') questionId: string,
    @Body() createQuestionCommentDto: CreateQuestionCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionCommentEntity> {
    return this.questionCommentService.create(
      questionId,
      createQuestionCommentDto,
      userId,
    );
  }

  @ApiUpdateQuestionCommentSwagger('질문글 댓글 수정')
  @Patch('/:commentId')
  updateQuestionComment(
    @Param('questionId') questionId: string,
    @Param('commentId') commentId: string,
    @Body() updateQuestionCommentDto: UpdateQuestionCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.questionCommentService.update(
      questionId,
      commentId,
      updateQuestionCommentDto,
      userId,
    );
  }

  @ApiDeleteQuestionCommentSwagger('질문글 댓글 삭제')
  @Delete('/:commentId')
  deleteQuestionComment(
    @Param('questionId') questionId: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.questionCommentService.delete(questionId, commentId, userId);
  }
}
