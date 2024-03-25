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
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { Roles } from '@src/auth/decorators/role-protected.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RoleGuard } from '@src/auth/guards/role.guard';
import { ERoleType } from '@src/user/enums/user.enum';
import { CreateLessonDto } from '@src/lesson/dtos/create-lesson.dto';
import { UpdateLessonDto } from '@src/lesson/dtos/update-lesson.dto';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { LessonService } from '@src/lesson/lesson.service';
import {
  ApiCreateLessonSwagger,
  ApiDeleteLessonSwagger,
  ApiUpdateLessonSwagger,
  ApiViewLessonSwagger,
} from '@src/lesson/lesson.swagger';
import { UserEntity } from '@src/user/entities/user.entity';

@ApiTags('LESSON')
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @ApiViewLessonSwagger('해당 강의를 구매한 유저의 수업 보기')
  @Get('/:lessonId')
  @UseGuards(AtGuard)
  async viewLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<LessonEntity> {
    return await this.lessonService.viewLesson(lessonId, user);
  }

  @ApiCreateLessonSwagger('수업 생성')
  @Post()
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async createLesson(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser('id') userId: string,
  ): Promise<LessonEntity> {
    return await this.lessonService.create(createLessonDto, userId);
  }

  @ApiUpdateLessonSwagger('수업 수정')
  @Patch('/:lessonId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.lessonService.update(lessonId, updateLessonDto, userId);
  }

  @ApiDeleteLessonSwagger('수업 삭제')
  @Delete('/:lessonId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async deleteLesson(
    @Param('lessonId') lessonId: string, //
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.lessonService.delete(lessonId, userId);
  }
}
