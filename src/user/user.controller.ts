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
  PhoneCheckDto,
  PhoneDto,
} from '@src/user/dtos/create-user.dto';
import { UpdateUserDto } from '@src/user/dtos/update-user.dto';
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
  ApisendCoolsmsSwagger,
  ApiUpdateUserSwagger,
  ApiUploadUserAvataSwagger,
  ApiWithdrawalUserSwagger,
} from '@src/user/user.swagger';
import {
  UserMyCourseQueryDto,
  UserQuestionQueryDto,
  UserWishQueryDto,
} from '@src/user/dtos/user.query.dto';
import { ApiTags } from '@nestjs/swagger';
import { imageFileFilter } from '@src/common/utils/fileFilter';
import { QuestionService } from '@src/question/question.service';
import { CourseWishService } from '@src/course/course-wish/course-wish.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { IJwtPayload } from '@src/auth/interfaces/auth.interface';

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
  async getMyProfile(
    @CurrentUser('id') userId: string, //
  ): Promise<UserEntity> {
    return await this.userService.getProfile(userId);
  }

  @ApiGetUserWishCoursesSwagger('유저의 찜한 강의 조회')
  @Get('/wishs')
  @UseGuards(AtGuard)
  async getMyWishCourses(
    @Query() userWishQueryDto: UserWishQueryDto,
    @CurrentUser('id') userId: string,
  ) {
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
  ) {
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
  ) {
    return await this.courseUserService.findMyCourses(
      userMyCourseQueryDto,
      userId,
    );
  }

  @ApiCreateUserSwagger('유저 회원가입')
  @Post('/signup')
  async registerUser(
    @Body() createUserDto: CreateUserDto, //
  ): Promise<UserEntity> {
    return await this.userService.create(createUserDto);
  }

  @ApiCheckNicknameSwagger('회원가입 시 닉네임 중복체크')
  @Post('/checknick')
  @HttpCode(200)
  async checkNickname(
    @Body() nickNameDto: NicknameDto, //
  ) {
    return await this.userService.checkNick(nickNameDto);
  }

  @ApisendCoolsmsSwagger('핸드폰 번호 등록시 인증번호 요청')
  @Post('/sms/send')
  @UseGuards(AtGuard)
  async sendCoolSMS(
    @Body() phoneDto: PhoneDto, //
  ) {
    return await this.userService.sendSMS(phoneDto);
  }

  @ApiCheckNicknameSwagger('핸드폰 인증번호 체크')
  @Post('/sms/check')
  @UseGuards(AtGuard)
  async checkCoolSMSToken(
    @CurrentUser('id') id: string,
    @Body() phoneCheckDto: PhoneCheckDto,
  ) {
    return await this.userService.checkToken(id, phoneCheckDto);
  }

  @ApiUpdateUserSwagger('유저 회원정보 수정')
  @Patch('/profile')
  @UseGuards(AtGuard)
  async updateUserProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
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
  async uploadUserAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    return await this.userService.upload(userId, file);
  }

  @ApiWithdrawalUserSwagger('유저 회원 탈퇴')
  @Delete('/withdrawal')
  @UseGuards(AtGuard)
  async withdrawalUser(
    @CurrentUser() user: IJwtPayload, //
  ): Promise<void> {
    return await this.userService.delete(user);
  }
}
