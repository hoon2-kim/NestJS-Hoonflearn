import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SectionEntity } from '@src/section/entities/section.entity';

export const ApiCreateSectionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiCreatedResponse({
      description: '섹션 생성 성공',
      type: SectionEntity,
    }),
    ApiNotFoundResponse({ description: '강의가 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateSectionSwagger = (summary: string) => {
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
    ApiNotFoundResponse({ description: '섹션이 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteSectionSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBearerAuth('access_token'),
    ApiOkResponse({
      description: '섹션 삭제 성공',
      type: 'boolean',
    }),
    ApiNotFoundResponse({ description: '섹션이 존재하지 않는 경우' }),
    ApiForbiddenResponse({
      description:
        '해당 강의를 만든 지식공유자가 아닌 경우 또는 지식공유자가 아닌 경우',
    }),
    ApiUnauthorizedResponse({
      description: '로그인 하지 않았을 경우',
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
