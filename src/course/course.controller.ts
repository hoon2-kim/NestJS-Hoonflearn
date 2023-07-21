import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role-protected.decorator';
import { AtGuard } from 'src/auth/guard/at.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // @Get()
  // findAllCourses() {
  //   // @Query()
  //   return this.courseService.findAll();
  // }

  // TODO: 세분화할꺼임 - 1. course-info 2. curriculums 3.review
  @Get('/:courseId')
  findOne(
    @Param('courseId') courseId: string, //
  ) {
    return this.courseService.findOne(courseId);
  }

  @Get('/:courseId/curriculums')
  findCourseCurriculum(
    @Param('courseId') courseId: string, //
  ) {
    return this.courseService.findCurriculum(courseId);
  }

  // 강의 만드는 방식 변경 할까?
  @Post()
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.courseService.create(createCourseDto, user);
  }

  @Post('/:courseId/wish')
  @UseGuards(AtGuard)
  courseWishAdd(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.courseService.addWish(courseId, user);
  }

  @Patch('/:courseId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.courseService.update(courseId, updateCourseDto, user);
  }

  @Patch('/:courseId/coverImage')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  uploadCourseCoverImage(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return this.courseService.uploadImage(courseId, user, file);
  }

  @Delete('/:courseId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteCourse(
    @Param('courseId') courseId: string, //
    @CurrentUser() user: UserEntity,
  ) {
    return this.courseService.delete(courseId, user);
  }

  @Delete('/:courseId/wish')
  @UseGuards(AtGuard)
  courseWishCancel(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.courseService.cancelWish(courseId, user);
  }
}
