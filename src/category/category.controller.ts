import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import {
  ApiCreateCategorySwagger,
  ApiCreateSubCategorySwagger,
  ApiDeleteCategorySwagger,
  ApiGetAllCategoriesSwagger,
  ApiGetCategorySwagger,
  ApiUpdateCategorySwagger,
} from './category.swagger';
import { CreateCategoryDto } from './dtos/request/create-category.dto';
import { UpdateCategoryDto } from './dtos/request/update-category.dto';
import { CategoryResponseDto } from './dtos/response/category.response.dto';
import { CategoryEntity } from './entities/category.entity';

@ApiTags('CATEGORY')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiGetAllCategoriesSwagger('모든 카테고리 조회')
  @Get()
  findAllCategories(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll();
  }

  @ApiGetCategorySwagger('카테고리 상세 조회')
  @Get('/:categoryId')
  findOneCategoryWithSub(
    @Param('categoryId') categoryId: string, //
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findOneById(categoryId);
  }

  @ApiCreateCategorySwagger('메인 카테고리 생성')
  @Post()
  createParentCategory(
    @Body() createCategoryDto: CreateCategoryDto, //
  ): Promise<CategoryEntity> {
    return this.categoryService.createParent(createCategoryDto);
  }

  @ApiCreateSubCategorySwagger('서브 카테고리 생성')
  @Post('/:categoryId/subCategories')
  createSubCategory(
    @Param('categoryId') categoryId: string,
    @Body() createCategoryDto: CreateCategoryDto, //
  ): Promise<CategoryEntity> {
    return this.categoryService.createSub(categoryId, createCategoryDto);
  }

  @ApiUpdateCategorySwagger('카테고리 수정(메인,서브)')
  @Put('/:categoryId')
  updateCategoryOrSub(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    return this.categoryService.update(categoryId, updateCategoryDto);
  }

  @ApiDeleteCategorySwagger('카테고리 삭제(메인,서브)')
  @Delete('/:categoryId')
  deleteCategoryOrSub(
    @Param('categoryId') categoryId: string, //
  ): Promise<boolean> {
    return this.categoryService.delete(categoryId);
  }
}
