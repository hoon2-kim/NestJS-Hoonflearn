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
import { AtGuard } from 'src/auth/guards/at.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { LessonService } from './lesson.service';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  createLesson(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.lessonService.create(createLessonDto, user);
  }

  @Patch('/:lessonId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.lessonService.update(lessonId, updateLessonDto, user);
  }

  @Delete('/:lessonId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteLesson(
    @Param('lessonId') lessonId: string, //
    @CurrentUser() user: UserEntity,
  ) {
    return this.lessonService.delete(lessonId, user);
  }
}
