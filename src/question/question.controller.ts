import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/auth/guard/at.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  findAllQuestions() {
    return this.questionService.findAll();
  }

  @Get('/courses/:courseId')
  findAllQuestionsByCourse(
    @Param('courseId') courseId: string, //
  ) {
    return this.questionService.findAllByCourse(courseId);
  }

  @Get('/:questionId')
  findOneQuestion(
    @Param('questionId') questionId: string, //
  ) {
    return this.questionService.findOne(questionId);
  }

  @Post()
  @UseGuards(AtGuard)
  createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionService.create(createQuestionDto, userId);
  }

  @Patch('/:questionId')
  @UseGuards(AtGuard)
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionService.update(questionId, updateQuestionDto, userId);
  }

  @Delete('/:questionId')
  deleteQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionService.delete(questionId, userId);
  }
}
