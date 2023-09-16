import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import {
  CourseDashBoardResponseDto,
  CourseDetailResponseDto,
  CourseListResponseDto,
} from './dtos/response/course.response';
import { CourseEntity } from './entities/course.entity';

export const ApiGetCourseDetailSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      type: CourseDetailResponseDto,
    }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않을 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetPurchaseStatusByUserSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({
      summary,
      description:
        '비로그인 유저의 경우 무조건 false, 로그인 유저의 경우 검증을 통해 boolean값 반환',
    }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        type: 'object',
        properties: {
          isPurchased: { type: 'boolean' },
        },
      },
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetCourseDashBoardSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      type: CourseDashBoardResponseDto,
    }),
    ApiNotFoundResponse({ description: '해당 강의가 존재하지 않을 경우' }),
    ApiForbiddenResponse({ description: '해당 강의를 구매하지 않은 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetCourseListSwagger = (summary: string) => {
  return applyDecorators(
    ApiParam({ name: 'mainCategoryId', required: false }),
    ApiParam({ name: 'subCategoryId', required: false }),
    ApiOperation({
      summary,
      description: `1. param없이 전체 조회 
                    2.메인카테고리를 통한 조회 
                    3.메인카테고리+서브카테고리를 통한 조회
                    `,
    }),
    ApiOkResponse({
      description: '조회 성공',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(CourseListResponseDto) },
          },
          meta: { $ref: getSchemaPath(PageMetaDto) },
        },
      },
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCreateCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '생성 성공',
      type: CourseEntity,
    }),
    ApiBadRequestResponse({
      description:
        '같은 제목의 강의가 이미 존재하는 경우 / 메인 카테고리에 서브 카테고리를 넣는 경우 또는 서브 카테고리에 메인 카테고리를 넣는 경우 ',
    }),
    ApiNotFoundResponse({
      description: '메인 카테고리 또는 서브 카테고리가 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({ description: '지식공유자가 아닌 경우' }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiWishCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '찜하기 성공 또는 취소 성공',
    }),
    ApiNotFoundResponse({
      description: '해당 강의가 존재하지 않는 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '수정 성공 / 아무것도 반환 안함',
    }),
    ApiBadRequestResponse({
      description:
        '같은 제목의 강의가 이미 존재하는 경우 / 메인 카테고리에 서브 카테고리를 넣는 경우 또는 서브 카테고리에 메인 카테고리를 넣는 경우 ',
    }),
    ApiNotFoundResponse({
      description:
        '해당 강의가 존재하지 않는 경우 / 메인 카테고리 또는 서브 카테고리가 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({
      description:
        '지식공유자가 아닌 경우 / 해당 강의를 만든 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUploadCourseCoverImageSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '업로드 성공',
      type: CourseEntity,
    }),
    ApiBadRequestResponse({
      description: '파일이 없는 경우',
    }),
    ApiNotFoundResponse({
      description: '해당 강의가 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({
      description:
        '지식공유자가 아닌 경우 / 해당 강의를 만든 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteCourseSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '삭제 성공',
      type: 'boolean',
    }),
    ApiNotFoundResponse({
      description: '해당 강의가 존재하지 않는 경우',
    }),
    ApiForbiddenResponse({
      description:
        '지식공유자가 아닌 경우 / 해당 강의를 만든 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
