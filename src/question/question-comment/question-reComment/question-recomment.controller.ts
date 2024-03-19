import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CreateQuestionReCommentDto } from '@src/question/question-comment/question-reComment/dtos/request/create-question-recomment.dto';
import { UpdateQuestionReCommentDto } from '@src/question/question-comment/question-reComment/dtos/request/update-question-recomment.dto';
import { QuestionCommentEntity } from '@src/question/question-comment/entities/question-comment.entity';
import {
  ApiCreateQuestionReCommentSwagger,
  ApiDeleteQuestionReCommentSwagger,
  ApiUpdateQuestionReCommentSwagger,
} from '@src/question/question-comment/question-comment.swagger';
import { QuestionRecommentService } from '@src/question/question-comment/question-reComment/question-recomment.service';

@ApiTags('QUESTION-RE_COMMENT')
@UseGuards(AtGuard)
@Controller('')
export class QuestionRecommentController {
  constructor(
    private readonly questionRecommentService: QuestionRecommentService,
  ) {}

  @ApiCreateQuestionReCommentSwagger(
    '질문글 댓글의 대댓글 생성(대댓글까지만 가능)',
  )
  @Post('/comments/:commentId/re-comments')
  createQuestionReComment(
    @Param('commentId') commentId: string,
    @Body() createQuestionReCommentDto: CreateQuestionReCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionCommentEntity> {
    return this.questionRecommentService.create(
      commentId,
      createQuestionReCommentDto,
      userId,
    );
  }

  @ApiUpdateQuestionReCommentSwagger('대댓글 수정')
  @Patch('/re-comments/:reCommentId')
  updateQuestionReComment(
    @Param('reCommentId') reCommentId: string,
    @Body() updateQuestionReCommentDto: UpdateQuestionReCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionCommentEntity> {
    return this.questionRecommentService.update(
      reCommentId,
      updateQuestionReCommentDto,
      userId,
    );
  }

  @ApiDeleteQuestionReCommentSwagger('대댓글 삭제')
  @Delete('/re-comments/:reCommentId')
  deleteQuestionReComment(
    @Param('reCommentId') reCommentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.questionRecommentService.delete(reCommentId, userId);
  }
}
