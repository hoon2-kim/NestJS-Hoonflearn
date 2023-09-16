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
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dtos/request/create-question.dto';
import { UpdateQuestionDto } from './dtos/request/update-question.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/auth/guards/at.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Put } from '@nestjs/common';
import { QuestionStatusDto } from './dtos/request/question-status.dto';
import { QuestionListQueryDto } from './dtos/query/question-list.query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateQuestionSwagger,
  ApiDeleteQuestionSwagger,
  ApiGetAllQuestionsSwagger,
  ApiGetQuestionsByCourseSwagger,
  ApiGetQuestionSwagger,
  ApiVoteQuestionSwagger,
  ApiReactionQuestionSwagger,
  ApiUpdateQuestionSwagger,
} from './question.swagger';
import { PageDto } from 'src/common/dtos/page.dto';
import {
  QuestionDetailResponseDto,
  QuestionListResponseDto,
} from './dtos/response/question.response.dto';
import { QuestionEntity } from './entities/question.entity';
import { QuestionVoteDto } from './dtos/request/question-vote.dto';

@ApiTags('QUESTION')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiGetAllQuestionsSwagger('모든 질문글 조회')
  @Get()
  findAllQuestions(
    @Query() questionListQueryDto: QuestionListQueryDto, //
  ): Promise<PageDto<QuestionListResponseDto>> {
    return this.questionService.findAll(questionListQueryDto);
  }

  @ApiGetQuestionsByCourseSwagger('해당 강의의 모든 질문글 조회')
  @Get('/courses/:courseId')
  findAllQuestionsByCourse(
    @Param('courseId') courseId: string,
    @Query() questionListQueryDto: QuestionListQueryDto,
  ): Promise<PageDto<QuestionListResponseDto>> {
    return this.questionService.findAllByCourse(courseId, questionListQueryDto);
  }

  @ApiGetQuestionSwagger('질문글 상세 조회')
  @Get('/:questionId')
  findOneQuestion(
    @Param('questionId') questionId: string, //
  ): Promise<QuestionDetailResponseDto> {
    return this.questionService.findOne(questionId);
  }

  @ApiCreateQuestionSwagger('질문글 작성')
  @Post()
  @UseGuards(AtGuard)
  createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionEntity> {
    return this.questionService.create(createQuestionDto, userId);
  }

  @ApiVoteQuestionSwagger('질문글 투표(추천/비추천) 또는 투표 취소')
  @Post('/:questionId/vote')
  @UseGuards(AtGuard)
  updateQuestionVoteStatus(
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
    @Body() questionVoteDto: QuestionVoteDto,
  ): Promise<void> {
    return this.questionService.updateVoteStatus(
      questionId,
      userId,
      questionVoteDto,
    );
  }

  @ApiUpdateQuestionSwagger('질문글 수정')
  @Patch('/:questionId')
  @UseGuards(AtGuard)
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.questionService.update(questionId, updateQuestionDto, userId);
  }

  @ApiReactionQuestionSwagger('질문글의 해결/미해결 상태 바꾸기')
  @Put('/:questionId/status')
  @UseGuards(AtGuard)
  reactionQuestionStatus(
    @Param('questionId') questionId: string,
    @Body() questionStatusDto: QuestionStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.questionService.status(questionId, questionStatusDto, userId);
  }

  @ApiDeleteQuestionSwagger('질문글 삭제')
  @Delete('/:questionId')
  deleteQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.questionService.delete(questionId, userId);
  }
}
