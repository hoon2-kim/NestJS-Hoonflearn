import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { QuestionCommentService } from '@src/question/question-comment/question-comment.service';
import { UpdateQuestionCommentDto } from '@src/question/question-comment/dtos/update-question-comment.dto';
import { CreateQuestionCommentDto } from '@src/question/question-comment/dtos/create-question-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateQuestionCommentSwagger,
  ApiDeleteQuestionCommentSwagger,
  ApiUpdateQuestionCommentSwagger,
} from '@src/question/question-comment/question-comment.swagger';
import { QuestionCommentEntity } from '@src/question/question-comment/entities/question-comment.entity';

@ApiTags('QUESTION-COMMENT')
@UseGuards(AtGuard)
@Controller('')
export class QuestionCommentController {
  constructor(
    private readonly questionCommentService: QuestionCommentService,
  ) {}

  @ApiCreateQuestionCommentSwagger('질문글 댓글 생성')
  @Post('/questions/:questionId/comments')
  async createQuestionComment(
    @Param('questionId') questionId: string,
    @Body() createQuestionCommentDto: CreateQuestionCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionCommentEntity> {
    return await this.questionCommentService.create(
      questionId,
      createQuestionCommentDto,
      userId,
    );
  }

  @ApiUpdateQuestionCommentSwagger('질문글 댓글 수정')
  @Patch('/comments/:commentId')
  async updateQuestionComment(
    @Param('questionId') questionId: string,
    @Param('commentId') commentId: string,
    @Body() updateQuestionCommentDto: UpdateQuestionCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.questionCommentService.update(
      questionId,
      commentId,
      updateQuestionCommentDto,
      userId,
    );
  }

  @ApiDeleteQuestionCommentSwagger('질문글 댓글 삭제')
  @Delete('/comments/:commentId')
  async deleteQuestionComment(
    @Param('questionId') questionId: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.questionCommentService.delete(
      questionId,
      commentId,
      userId,
    );
  }
}
