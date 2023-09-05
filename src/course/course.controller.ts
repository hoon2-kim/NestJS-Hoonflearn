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
import { AtGuard } from 'src/auth/guards/at.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dtos/request/create-course.dto';
import { UpdateCourseDto } from './dtos/request/update-course.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { CourseListQueryDto } from './dtos/query/course-list.query.dto';
import { ApiTags } from '@nestjs/swagger';
import { ERoleType } from 'src/user/enums/user.enum';
import { CoursePriceValidationPipe } from 'src/common/pipes/course-price.pipe';
import {
  ApiCancelWishCourseSwagger,
  ApiCreateCourseSwagger,
  ApiDeleteCourseSwagger,
  ApiGetCourseCurriculumSwagger,
  ApiGetCourseInfoSwagger,
  ApiGetCourseListSwagger,
  ApiUpdateCourseSwagger,
  ApiUploadCourseCoverImageSwagger,
  ApiWishCourseSwagger,
} from './course.swagger';
import {
  CourseDetailCourseInfoResponseDto,
  CourseDetailCurriculumResponseDto,
  CourseListResponseDto,
} from './dtos/response/course.response';
import { PageDto } from 'src/common/dtos/page.dto';
import { CourseEntity } from './entities/course.entity';

@ApiTags('COURSE')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiGetCourseInfoSwagger('강의 상세 조회(강의정보)')
  @Get('/:courseId/course-info')
  findOneCourseInfo(
    @Param('courseId') courseId: string, //
  ): Promise<CourseDetailCourseInfoResponseDto> {
    return this.courseService.findInfo(courseId);
  }

  @ApiGetCourseCurriculumSwagger('강의 상세 조회(커리큘럼)')
  @Get('/:courseId/curriculums')
  findCourseCurriculum(
    @Param('courseId') courseId: string, //
  ): Promise<CourseDetailCurriculumResponseDto> {
    return this.courseService.findCurriculum(courseId);
  }

  @ApiGetCourseListSwagger('강의 전체 조회')
  @Get('/:mainCategoryId?/:subCategoryId?')
  findAllCourses(
    @Query() courseListQueryDto: CourseListQueryDto,
    @Param('mainCategoryId') mainCategoryId?: string,
    @Param('subCategoryId') subCategoryId?: string,
  ): Promise<PageDto<CourseListResponseDto>> {
    return this.courseService.findAllCourse(
      courseListQueryDto,
      mainCategoryId,
      subCategoryId,
    );
  }

  @ApiCreateCourseSwagger('강의 생성')
  @Post()
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  createCourse(
    @Body(CoursePriceValidationPipe) createCourseDto: CreateCourseDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CourseEntity> {
    return this.courseService.create(createCourseDto, user);
  }

  @ApiWishCourseSwagger('강의 찜하기')
  @Post('/:courseId/wish')
  @UseGuards(AtGuard)
  courseWishAdd(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.courseService.addWish(courseId, user);
  }

  @ApiUpdateCourseSwagger('강의 수정')
  @Patch('/:courseId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.courseService.update(courseId, updateCourseDto, user);
  }

  @ApiUploadCourseCoverImageSwagger('강의 썸네일 업로드')
  @Patch('/:courseId/coverImage')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  uploadCourseCoverImage(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return this.courseService.uploadImage(courseId, user, file);
  }

  @ApiDeleteCourseSwagger('강의 삭제')
  @Delete('/:courseId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteCourse(
    @Param('courseId') courseId: string, //
    @CurrentUser() user: UserEntity,
  ): Promise<boolean> {
    return this.courseService.delete(courseId, user);
  }

  @ApiCancelWishCourseSwagger('강의 찜하기 취소')
  @Delete('/:courseId/wish')
  @UseGuards(AtGuard)
  courseWishCancel(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.courseService.cancelWish(courseId, user);
  }
}
