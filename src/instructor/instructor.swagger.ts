import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { CourseListByInstructorResponseDto } from '@src/course/dtos/response/course.response';
import { QuestionListResponseDto } from '@src/question/dtos/response/question.response.dto';
import { ReviewResponseWithoutCommentDto } from '@src/review/dtos/response/review.response.dto';
import { EFieldOfHopeType } from '@src/instructor/enums/instructor.enum';

export const ApiGetMyCoursesByInstructorSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(CourseListByInstructorResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiForbiddenResponse({ description: '지식공유자가 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetQuestionsByMyCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
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
    ApiForbiddenResponse({ description: '지식공유자가 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetReviewsByMyCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(ReviewResponseWithoutCommentDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiForbiddenResponse({ description: '지식공유자가 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiRegisterInstructorSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '등록 성공',
      schema: {
        properties: {
          access_token: { type: 'string' },
          instructorProfile: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              contactEmail: { type: 'string' },
              nameOrBusiness: { type: 'string' },
              fieldOfHope: { type: 'string', enum: [EFieldOfHopeType] },
              aboutMe: { type: 'string' },
              link: { type: 'string', nullable: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        '이미 지식공유자로 등록한 경우 / 이미 존재하는 이메일일 경우 / 이미 존재하는 지식공유자 실명 또는 사업체명일 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
