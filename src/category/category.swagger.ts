import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CategoryResponseDto } from '@src/category/dtos/response/category.response.dto';
import { CategoryEntity } from '@src/category/entities/category.entity';

export const ApiGetAllCategoriesSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({
      summary,
      description: 'false일 경우 메인카테고리만',
    }),
    ApiOkResponse({
      description: '조회 성공',
      type: CategoryResponseDto,
      isArray: true,
    }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiGetCategorySwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '조회 성공',
      type: CategoryResponseDto,
    }),
    ApiBadRequestResponse({ description: '서브 카테고리 ID를 넣은 경우' }),
    ApiNotFoundResponse({ description: '해당 카테고리가 존재하지 않을 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCreateCategorySwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '생성 성공',
      type: CategoryEntity,
    }),
    ApiBadRequestResponse({ description: '카테고리 이름이 중복일 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiCreateSubCategorySwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: '생성 성공',
      type: CategoryEntity,
    }),
    ApiBadRequestResponse({ description: '카테고리 이름이 중복일 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiUpdateCategorySwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '수정 성공',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    }),
    ApiBadRequestResponse({ description: '카테고리 이름이 중복일 경우' }),
    ApiNotFoundResponse({ description: '해당 카테고리가 존재하지 않을 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};

export const ApiDeleteCategorySwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: '삭제 성공',
      type: 'boolean',
    }),
    ApiNotFoundResponse({ description: '해당 카테고리가 존재하지 않을 경우' }),
    ApiInternalServerErrorResponse({ description: '서버 오류' }),
  );
};
