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
import { QuestionService } from '@src/question/question.service';
import { CreateQuestionDto } from '@src/question/dtos/create-question.dto';
import { UpdateQuestionDto } from '@src/question/dtos/update-question.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { QuestionStatusDto } from '@src/question/dtos/question-status.dto';
import { QuestionListQueryDto } from '@src/question/dtos/question-list.query.dto';
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
} from '@src/question/question.swagger';
import { PageDto } from '@src/common/dtos/page.dto';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { QuestionVoteDto } from '@src/question/dtos/question-vote.dto';

@ApiTags('QUESTION')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiGetAllQuestionsSwagger('모든 질문글 조회')
  @Get()
  async findAllQuestions(
    @Query() questionListQueryDto: QuestionListQueryDto, //
  ): Promise<PageDto<QuestionEntity>> {
    return await this.questionService.findAll(questionListQueryDto);
  }

  @ApiGetQuestionsByCourseSwagger('해당 강의의 모든 질문글 조회')
  @Get('/courses/:courseId')
  async findAllQuestionsByCourse(
    @Param('courseId') courseId: string,
    @Query() questionListQueryDto: QuestionListQueryDto,
  ): Promise<PageDto<QuestionEntity>> {
    return await this.questionService.findAllByCourse(
      courseId,
      questionListQueryDto,
    );
  }

  @ApiGetQuestionSwagger('질문글 상세 조회')
  @Get('/:questionId')
  async findOneQuestion(
    @Param('questionId') questionId: string, //
  ): Promise<QuestionEntity> {
    return await this.questionService.findOne(questionId);
  }

  @ApiCreateQuestionSwagger('질문글 작성')
  @Post()
  @UseGuards(AtGuard)
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionEntity> {
    return await this.questionService.create(createQuestionDto, userId);
  }

  @ApiVoteQuestionSwagger('질문글 투표(추천/비추천) 또는 투표 취소')
  @Post('/:questionId/vote')
  @UseGuards(AtGuard)
  async updateQuestionVoteStatus(
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
    @Body() questionVoteDto: QuestionVoteDto,
  ): Promise<void> {
    return await this.questionService.updateVoteStatus(
      questionId,
      userId,
      questionVoteDto,
    );
  }

  @ApiUpdateQuestionSwagger('질문글 수정')
  @Patch('/:questionId')
  @UseGuards(AtGuard)
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
  ): Promise<QuestionEntity> {
    return await this.questionService.update(
      questionId,
      updateQuestionDto,
      userId,
    );
  }

  @ApiReactionQuestionSwagger('질문글의 해결/미해결 상태 바꾸기')
  @Patch('/:questionId/status')
  @UseGuards(AtGuard)
  async reactionQuestionStatus(
    @Param('questionId') questionId: string,
    @Body() questionStatusDto: QuestionStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.questionService.status(
      questionId,
      questionStatusDto,
      userId,
    );
  }

  @ApiDeleteQuestionSwagger('질문글 삭제')
  @Delete('/:questionId')
  async deleteQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.questionService.delete(questionId, userId);
  }
}
