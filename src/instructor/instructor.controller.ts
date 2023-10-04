import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { InstructorService } from '@src/instructor/instructor.service';
import { CreateInstructorDto } from '@src/instructor/dtos/request/create-instructor.dto';
import { Roles } from '@src/auth/decorators/role-protected.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RoleGuard } from '@src/auth/guards/role.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { Response } from 'express';
import { IInstructorTokens } from '@src/instructor/interfaces/instructor.interface';
import { UserEntity } from '@src/user/entities/user.entity';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from '@src/instructor/dtos/query/instructor.query.dto';
import { ApiTags } from '@nestjs/swagger';
import { ERoleType } from '@src/user/enums/user.enum';
import {
  ApiGetMyCoursesByInstructorSwagger,
  ApiGetQuestionsByMyCourseSwagger,
  ApiGetReviewsByMyCourseSwagger,
  ApiRegisterInstructorSwagger,
} from '@src/instructor/instructor.swagger';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseListByInstructorResponseDto } from '@src/course/dtos/response/course.response';
import { QuestionListResponseDto } from '@src/question/dtos/response/question.response.dto';
import { ReviewResponseWithoutCommentDto } from '@src/review/dtos/response/review.response.dto';

@ApiTags('INSTRUCTOR')
@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @ApiGetMyCoursesByInstructorSwagger('지식공유자의 강의들 조회')
  @Get('/courses')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  findMyCourses(
    @Query() instructorCourseQueryDto: InstructorCourseQueryDto,
    @CurrentUser() user: UserEntity,
  ): Promise<PageDto<CourseListByInstructorResponseDto>> {
    return this.instructorService.getMyCoursesByInstructor(
      instructorCourseQueryDto,
      user,
    );
  }

  @ApiGetQuestionsByMyCourseSwagger('지식공유자가 만든 강의들의 질문들 조회')
  @Get('/questions')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  getQuestionsMyCourses(
    @Query() instructorQuestionQueryDto: InstructorQuestionQueryDto,
    @CurrentUser() user: UserEntity,
  ): Promise<PageDto<QuestionListResponseDto>> {
    return this.instructorService.getQuestionsByMyCourses(
      instructorQuestionQueryDto,
      user,
    );
  }

  @ApiGetReviewsByMyCourseSwagger('지식공유자가 만든 강의들의 리뷰들 조회')
  @Get('/reviews')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  getReviewsMyCourses(
    @Query() instructorReviewQueryDto: InstructorReviewQueryDto,
    @CurrentUser() user: UserEntity,
  ): Promise<PageDto<ReviewResponseWithoutCommentDto>> {
    return this.instructorService.getReviewsByMyCourses(
      instructorReviewQueryDto,
      user,
    );
  }

  @ApiRegisterInstructorSwagger('지식공유자 등록')
  @Post('/register')
  @UseGuards(AtGuard)
  registerInstructor(
    @Body() createInstructorDto: CreateInstructorDto,
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IInstructorTokens> {
    return this.instructorService.create(createInstructorDto, user, res);
  }
}
