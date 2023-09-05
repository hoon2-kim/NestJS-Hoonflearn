import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CourseUserEntity } from 'src/course_user/entities/course-user.entity';

export const ApiRegisterFreeCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({ description: '등록 성공', type: CourseUserEntity }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않을 경우' }),
    ApiBadRequestResponse({
      description: '해당 강의가 무료가 아닐 경우 또는 이미 등록한 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCancelFreeCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({ description: '취소 성공', type: 'boolean' }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않을 경우' }),
    ApiBadRequestResponse({
      description: '해당 강의가 무료가 아닐 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
