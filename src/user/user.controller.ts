import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  HttpCode,
} from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import {
  CreateUserDto,
  NicknameDto,
} from '@src/user/dtos/request/create-user.dto';
import { UpdateUserDto } from '@src/user/dtos/request/update-user.dto';
import { AtGuard } from '@src/auth/guards/at.guard';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { UserEntity } from '@src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCheckNicknameSwagger,
  ApiCreateUserSwagger,
  ApiGetMyCoursesSwagger,
  ApiGetMyQuestionsSwagger,
  ApiGetUserWishCoursesSwagger,
  ApiProfileUserSwagger,
  ApiUpdateUserSwagger,
  ApiUploadUserAvataSwagger,
  ApiWithdrawalUserSwagger,
} from '@src/user/user.swagger';
import {
  UserMyCourseQueryDto,
  UserQuestionQueryDto,
  UserWishQueryDto,
} from '@src/user/dtos/query/user.query.dto';
import { ApiTags } from '@nestjs/swagger';
import { CourseWishListResponseDto } from '@src/course_wish/dtos/response/course-wish.reponse.dto';
import { QuestionListResponseDto } from '@src/question/dtos/response/question.response.dto';
import { CourseUserListResponseDto } from '@src/course_user/dtos/response/course-user.response.dto';
import { imageFileFilter } from '@src/common/helpers/fileFilter.helper';
import { PageDto } from '@src/common/dtos/page.dto';
import { QuestionService } from '@src/question/question.service';
import { CourseWishService } from '@src/course_wish/course_wish.service';
import { CourseUserService } from '@src/course_user/course-user.service';

@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
    private readonly courseWishService: CourseWishService,
    private readonly courseUserService: CourseUserService,
  ) {}

  @ApiProfileUserSwagger('유저 프로필 조회')
  @Get('/profile')
  @UseGuards(AtGuard)
  getMyProfile(
    @CurrentUser('id') userId: string, //
  ): Promise<UserEntity> {
    return this.userService.getProfile(userId);
  }

  @ApiGetUserWishCoursesSwagger('유저의 찜한 강의 조회')
  @Get('/wishs')
  @UseGuards(AtGuard)
  async getMyWishCourses(
    @Query() userWishQueryDto: UserWishQueryDto,
    @CurrentUser('id') userId: string,
  ): Promise<PageDto<CourseWishListResponseDto>> {
    return await this.courseWishService.findWishCoursesByUser(
      userWishQueryDto,
      userId,
    );
  }

  @ApiGetMyQuestionsSwagger('유저가 작성한 질문글 조회')
  @Get('/questions')
  @UseGuards(AtGuard)
  async getMyQuestions(
    @Query() userQuestionQueryDto: UserQuestionQueryDto,
    @CurrentUser('id') userId: string,
  ): Promise<PageDto<QuestionListResponseDto>> {
    return await this.questionService.findMyQuestions(
      userQuestionQueryDto,
      userId,
    );
  }

  @ApiGetMyCoursesSwagger('유저가 수강하는 강의 조회')
  @Get('/courses')
  @UseGuards(AtGuard)
  async getMyCourses(
    @Query() userMyCourseQueryDto: UserMyCourseQueryDto,
    @CurrentUser('id') userId: string,
  ): Promise<PageDto<CourseUserListResponseDto>> {
    return await this.courseUserService.findMyCourses(
      userMyCourseQueryDto,
      userId,
    );
  }

  @ApiCreateUserSwagger('유저 회원가입')
  @Post('/signup')
  registerUser(
    @Body() createUserDto: CreateUserDto, //
  ): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }

  @ApiCheckNicknameSwagger('회원가입 시 닉네임 중복체크')
  @Post('/checknick')
  @HttpCode(200)
  checkNickname(
    @Body() nickNameDto: NicknameDto, //
  ): Promise<{ message: string }> {
    return this.userService.checkNick(nickNameDto);
  }

  @ApiUpdateUserSwagger('유저 회원정보 수정')
  @Patch('/profile')
  @UseGuards(AtGuard)
  updateUserProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string }> {
    return this.userService.update(userId, updateUserDto);
  }

  @ApiUploadUserAvataSwagger('유저 프로필 이미지 업로드')
  @Patch('/profile/avatar')
  @UseGuards(AtGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  uploadUserAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return this.userService.upload(userId, file);
  }

  @ApiWithdrawalUserSwagger('유저 회원 탈퇴')
  @Delete('/withdrawal')
  @UseGuards(AtGuard)
  withdrawalUser(
    @CurrentUser('id') userId: string, //
  ): Promise<boolean> {
    return this.userService.delete(userId);
  }
}
