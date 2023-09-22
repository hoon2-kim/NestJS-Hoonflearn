import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LessonResponseDto } from '@src/lesson/dtos/response/lesson.response.dto';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';

export const ApiViewLessonSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '수업 조회 성공',
      type: LessonResponseDto,
    }),
    ApiNotFoundResponse({ description: '해당 수업이 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description: '해당 강의를 구매한 유저가 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCreateLessonSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({ description: '생성 성공', type: LessonEntity }),
    ApiNotFoundResponse({ description: '해당 섹션이 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateLessonSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({ description: '수정 성공 / 아무것도 반환 안함' }),
    ApiNotFoundResponse({ description: '해당 수업이 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteLessonSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({ description: '삭제 성공', type: 'boolean' }),
    ApiNotFoundResponse({ description: '해당 수업이 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({ description: '로그인하지 않은 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
