import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { QuestionCommentService } from './question-comment.service';
import { UpdateQuestionCommentDto } from './dto/update-question-comment.dto';
import { CreateQuestionCommentDto } from './dto/create-question-comment.dto';

@Controller('questions/comments')
export class QuestionCommentController {
  constructor(
    private readonly questionCommentService: QuestionCommentService,
  ) {}

  @Post()
  @UseGuards(AtGuard)
  createQuestionComment(
    @Body() createQuestionCommentDto: CreateQuestionCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionCommentService.create(createQuestionCommentDto, userId);
  }

  @Patch('/:questionId')
  @UseGuards(AtGuard)
  updateQuestionComment(
    @Param('questionId') questionId: string,
    @Body() updateQuestionCommentDto: UpdateQuestionCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionCommentService.update(
      questionId,
      updateQuestionCommentDto,
      userId,
    );
  }

  @Delete('/:questionId')
  @UseGuards(AtGuard)
  deleteQuestionComment(
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionCommentService.delete(questionId, userId);
  }
}
