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
import { UserEntity } from '@src/user/entities/user.entity';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { CourseEntity } from '@src/course/entities/course.entity';
import { CourseWishEntity } from '@src/course/course-wish/entities/course-wish.entity';

export const ApiProfileUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '프로필 조회 성공',
      type: UserEntity,
    }),
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

export const ApiCheckNicknameSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '닉네임 중복 체크 성공',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: '닉네임 중복 오류',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApisendCoolsmsSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '핸드폰 인증번호 전송 성공',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApicheckTokenSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '핸드폰 인증번호 인증 성공',
    }),
    ApiBadRequestResponse({
      description:
        '인증번호를 하지않은 경우 또는 인증번호가 일치하지 않은 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '수정 성공',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    }),
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
            items: { $ref: getSchemaPath(CourseWishEntity) },
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
            items: { $ref: getSchemaPath(QuestionEntity) },
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
            items: { $ref: getSchemaPath(CourseEntity) },
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
