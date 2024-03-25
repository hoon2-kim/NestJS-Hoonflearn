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
import { CreateInstructorDto } from '@src/instructor/dtos/create-instructor.dto';
import { Roles } from '@src/auth/decorators/role-protected.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RoleGuard } from '@src/auth/guards/role.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { Response } from 'express';
import {
  InstructorCourseQueryDto,
  InstructorQuestionQueryDto,
  InstructorReviewQueryDto,
} from '@src/instructor/dtos/instructor.query.dto';
import { ApiTags } from '@nestjs/swagger';
import { ERoleType } from '@src/user/enums/user.enum';
import {
  ApiGetMyCoursesByInstructorSwagger,
  ApiGetQuestionsByMyCourseSwagger,
  ApiGetReviewsByMyCourseSwagger,
  ApiRegisterInstructorSwagger,
} from '@src/instructor/instructor.swagger';
import { PageDto } from '@src/common/dtos/page.dto';
import { IAuthToken, IJwtPayload } from '@src/auth/interfaces/auth.interface';
import { CourseEntity } from '@src/course/entities/course.entity';
import { QuestionEntity } from '@src/question/entities/question.entity';

@ApiTags('INSTRUCTOR')
@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @ApiGetMyCoursesByInstructorSwagger('지식공유자의 강의들 조회')
  @Get('/courses')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async findMyCourses(
    @Query() instructorCourseQueryDto: InstructorCourseQueryDto,
    @CurrentUser() user: IJwtPayload,
  ): Promise<PageDto<CourseEntity>> {
    return await this.instructorService.getMyCoursesByInstructor(
      instructorCourseQueryDto,
      user,
    );
  }

  @ApiGetQuestionsByMyCourseSwagger('지식공유자가 만든 강의들의 질문들 조회')
  @Get('/questions')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async getQuestionsMyCourses(
    @Query() instructorQuestionQueryDto: InstructorQuestionQueryDto,
    @CurrentUser() user: IJwtPayload,
  ): Promise<PageDto<QuestionEntity>> {
    return await this.instructorService.getQuestionsByMyCourses(
      instructorQuestionQueryDto,
      user,
    );
  }

  @ApiGetReviewsByMyCourseSwagger('지식공유자가 만든 강의들의 리뷰들 조회')
  @Get('/reviews')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async getReviewsMyCourses(
    @Query() instructorReviewQueryDto: InstructorReviewQueryDto,
    @CurrentUser() user: IJwtPayload,
  ): Promise<PageDto<any>> {
    return await this.instructorService.getReviewsByMyCourses(
      instructorReviewQueryDto,
      user,
    );
  }

  @ApiRegisterInstructorSwagger('지식공유자 등록')
  @Post('/register')
  @UseGuards(AtGuard)
  async registerInstructor(
    @Body() createInstructorDto: CreateInstructorDto,
    @CurrentUser() user: IJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthToken> {
    return await this.instructorService.create(createInstructorDto, user, res);
  }
}
