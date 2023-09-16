import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role-protected.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserEntity } from 'src/user/entities/user.entity';
import { ERoleType } from 'src/user/enums/user.enum';
import { CreateLessonDto } from './dtos/request/create-lesson.dto';
import { UpdateLessonDto } from './dtos/request/update-lesson.dto';
import { LessonResponseDto } from './dtos/response/lesson.response.dto';
import { LessonEntity } from './entities/lesson.entity';
import { LessonService } from './lesson.service';
import {
  ApiCreateLessonSwagger,
  ApiDeleteLessonSwagger,
  ApiUpdateLessonSwagger,
  ApiViewLessonSwagger,
} from './lesson.swagger';

@ApiTags('LESSON')
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @ApiViewLessonSwagger('해당 강의를 구매한 유저의 수업 보기')
  @Get('/:lessonId')
  @UseGuards(AtGuard)
  viewLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
  ): Promise<LessonResponseDto> {
    return this.lessonService.viewLesson(lessonId, userId);
  }

  @ApiCreateLessonSwagger('수업 생성')
  @Post()
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  createLesson(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: UserEntity,
  ): Promise<LessonEntity> {
    return this.lessonService.create(createLessonDto, user);
  }

  @ApiUpdateLessonSwagger('수업 수정')
  @Patch('/:lessonId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.lessonService.update(lessonId, updateLessonDto, user);
  }

  @ApiDeleteLessonSwagger('수업 삭제')
  @Delete('/:lessonId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteLesson(
    @Param('lessonId') lessonId: string, //
    @CurrentUser() user: UserEntity,
  ): Promise<boolean> {
    return this.lessonService.delete(lessonId, user);
  }
}
