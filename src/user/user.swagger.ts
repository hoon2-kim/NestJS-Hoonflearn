import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserResponseDto } from '@src/user/dtos/response/user.response';
import { CourseWishListResponseDto } from '@src/course_wish/dtos/response/course-wish.reponse.dto';
import { QuestionListResponseDto } from '@src/question/dtos/response/question.response.dto';
import { CourseUserListResponseDto } from '@src/course_user/dtos/response/course-user.response.dto';
import { UserEntity } from '@src/user/entities/user.entity';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';

export const ApiProfileUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '프로필 조회 성공', type: UserResponseDto }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCreateUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '회원가입 성공',
      type: UserEntity,
    }),
    ApiBadRequestResponse({
      description: '이메일 중복/닉네임 중복/핸드폰 번호 중복 오류',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '수정 성공 / 아무것도 반환 안함' }),
    ApiNotFoundResponse({
      description: '유저가 존재하지 않을 경우',
    }),
    ApiBadRequestResponse({
      description: '유저 닉네임을 수정한는데 이미 존재하는 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUploadUserAvataSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    ApiOkResponse({
      description:
        'AWS-S3에 업로드 성공, 이미 이미지가 있는 경우 기존에 저장되어 있던 이미지 삭제 후 대체 / AWS-S3 url 반환',
      type: 'string',
    }),
    ApiBadRequestResponse({ description: '파일이 없는 경우' }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiWithdrawalUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '회원탈퇴 성공', type: 'boolean' }),
    ApiNotFoundResponse({ description: '유저가 없는 경우' }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetUserWishCoursesSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(CourseWishListResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetMyQuestionsSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(QuestionListResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetMyCoursesSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(CourseUserListResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
