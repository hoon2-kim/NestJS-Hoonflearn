import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CategoryResponseDto } from './dtos/response/category.response.dto';
import { CategoryEntity } from './entities/category.entity';

export const ApiGetAllCategoriesSwagger = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
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
      description: '수정 성공 / 아무것도 반환안함',
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
