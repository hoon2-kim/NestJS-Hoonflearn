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
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { Roles } from '@src/auth/decorators/role-protected.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RoleGuard } from '@src/auth/guards/role.guard';
import { CourseService } from '@src/course/course.service';
import { CreateCourseDto } from '@src/course/dtos/create-course.dto';
import { UpdateCourseDto } from '@src/course/dtos/update-course.dto';
import { UserEntity } from '@src/user/entities/user.entity';
import { CourseListQueryDto } from '@src/course/dtos/course-list.query.dto';
import { ApiTags } from '@nestjs/swagger';
import { ERoleType } from '@src/user/enums/user.enum';
import { CoursePriceValidationPipe } from '@src/course/pipes/course-price.pipe';
import {
  ApiCreateCourseSwagger,
  ApiDeleteCourseSwagger,
  ApiGetCourseDashBoardSwagger,
  ApiGetCourseDetailSwagger,
  ApiGetCourseListSwagger,
  ApiGetPurchaseStatusByUserSwagger,
  ApiUpdateCourseSwagger,
  ApiUploadCourseCoverImageSwagger,
  ApiWishCourseSwagger,
} from '@src/course/course.swagger';
import { CourseEntity } from '@src/course/entities/course.entity';
import { PublicGuard } from '@src/auth/guards/public.guard';
import { CurrentOptionalUser } from '@src/auth/decorators/current-optionalUser.decorator';

@ApiTags('COURSE')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiGetCourseDetailSwagger('강의 상세 조회')
  @Get('/:courseId')
  async findCourseDetail(
    @Param('courseId') courseId: string, //
  ): Promise<CourseEntity> {
    return await this.courseService.findCourseDetail(courseId);
  }

  @ApiGetPurchaseStatusByUserSwagger('강의 구매 여부 상태 반환')
  @Get('/:courseId/purchase-status')
  @UseGuards(PublicGuard)
  async getPurchaseStatusByUser(
    @Param('courseId') courseId: string,
    @CurrentOptionalUser('id') userId: string | null,
  ): Promise<{ isPurchased: boolean }> {
    return await this.courseService.getStatusByUser(courseId, userId);
  }

  @ApiGetCourseDashBoardSwagger('강의 구매한 유저를 위한 대시보드')
  @Get('/:courseId/dashboard')
  @UseGuards(AtGuard)
  async getCourseDashBoard(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.courseService.getDashBoard(courseId, userId);
  }

  @ApiGetCourseListSwagger('강의 전체 조회')
  @Get('/:mainCategoryId?/:subCategoryId?')
  async findAllCourses(
    @Query() courseListQueryDto: CourseListQueryDto,
    @Param('mainCategoryId') mainCategoryId?: string,
    @Param('subCategoryId') subCategoryId?: string,
  ): Promise<any> {
    return await this.courseService.findAllCourse(
      courseListQueryDto,
      mainCategoryId,
      subCategoryId,
    );
  }

  @ApiCreateCourseSwagger('강의 생성')
  @Post()
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async createCourse(
    @Body(CoursePriceValidationPipe) createCourseDto: CreateCourseDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CourseEntity> {
    return await this.courseService.create(createCourseDto, user);
  }

  @ApiWishCourseSwagger('강의 찜하기 / 찜하기 취소')
  @Post('/:courseId/wish')
  @UseGuards(AtGuard)
  async courseWishAdd(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.courseService.addOrCancelWish(courseId, userId);
  }

  @ApiUpdateCourseSwagger('강의 수정')
  @Patch('/:courseId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return await this.courseService.update(courseId, updateCourseDto, user);
  }

  @ApiUploadCourseCoverImageSwagger('강의 썸네일 업로드')
  @Patch('/:courseId/coverImage')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  async uploadCourseCoverImage(
    @Param('courseId') courseId: string,
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return await this.courseService.uploadImage(courseId, user, file);
  }

  @ApiDeleteCourseSwagger('강의 삭제')
  @Delete('/:courseId')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async deleteCourse(
    @Param('courseId') courseId: string, //
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return await this.courseService.delete(courseId, user);
  }
}
