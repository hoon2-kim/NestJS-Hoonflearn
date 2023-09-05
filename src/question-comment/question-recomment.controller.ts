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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CreateQuestionReCommentDto } from './dtos/request/create-question-recomment.dto';
import { UpdateQuestionReCommentDto } from './dtos/request/update-question-recomment.dto';
import { QuestionCommentEntity } from './entities/question-comment.entity';
import {
  ApiCreateQuestionReCommentSwagger,
  ApiDeleteQuestionReCommentSwagger,
  ApiUpdateQuestionReCommentSwagger,
} from './question-comment.swagger';
import { QuestionRecommentService } from './question-recomment.service';

@ApiTags('QUESTION-RE_COMMENT')
@UseGuards(AtGuard)
@Controller('re-comments')
export class QuestionRecommentController {
  constructor(
    private readonly questionRecommentService: QuestionRecommentService,
  ) {}

  @ApiCreateQuestionReCommentSwagger(
    '질문글 댓글의 대댓글 생성(대댓글까지만 가능)',
  )
  @Post()
  async createQuestionReComment(
    @Body() createQuestionReCommentDto: CreateQuestionReCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionCommentEntity> {
    return this.questionRecommentService.create(
      createQuestionReCommentDto,
      userId,
    );
  }

  @ApiUpdateQuestionReCommentSwagger('대댓글 수정')
  @Patch('/:reCommentId')
  async updateQuestionReComment(
    @Param('reCommentId') reCommentId: string,
    @Body() updateQuestionReCommentDto: UpdateQuestionReCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.questionRecommentService.update(
      reCommentId,
      updateQuestionReCommentDto,
      userId,
    );
  }

  @ApiDeleteQuestionReCommentSwagger('대댓글 삭제')
  @Delete('/:reCommentId')
  async deleteQuestionReComment(
    @Param('reCommentId') reCommentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.questionRecommentService.delete(reCommentId, userId);
  }
}
