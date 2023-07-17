import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role-protected.decorator';
import { AtGuard } from 'src/auth/guard/at.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonService } from './lesson.service';

@Controller('courses/:courseId/lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  createLesson(
    @Param('courseId') courseId: string,
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.lessonService.create(courseId, createLessonDto, user);
  }

  @Patch('/:lessonId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  updateLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.lessonService.update(courseId, lessonId, updateLessonDto, user);
  }

  @Delete('/:lessonId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string, //
    @CurrentUser() user: UserEntity,
  ) {
    return this.lessonService.delete(courseId, lessonId, user);
  }
}
