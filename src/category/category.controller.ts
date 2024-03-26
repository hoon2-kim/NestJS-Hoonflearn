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
import { CategoryService } from '@src/category/category.service';
import {
  ApiCreateCategorySwagger,
  ApiCreateSubCategorySwagger,
  ApiDeleteCategorySwagger,
  ApiGetAllCategoriesSwagger,
  ApiGetCategorySwagger,
  ApiUpdateCategorySwagger,
} from '@src/category/category.swagger';
import { CreateCategoryDto } from '@src/category/dtos/create-category.dto';
import { UpdateCategoryDto } from '@src/category/dtos/update-category.dto';
import { CategoryEntity } from '@src/category/entities/category.entity';

@ApiTags('CATEGORY')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiGetAllCategoriesSwagger('모든 카테고리 조회')
  @Get()
  async findAllCategories(): Promise<CategoryEntity[]> {
    return await this.categoryService.findAll();
  }

  @ApiGetCategorySwagger('카테고리 상세 조회(메인카테고리)')
  @Get('/:categoryId')
  async findOneCategoryWithSub(
    @Param('categoryId') categoryId: string, //
  ): Promise<CategoryEntity> {
    return this.categoryService.findOneWithSub(categoryId);
  }

  @ApiCreateCategorySwagger('메인 카테고리 생성')
  @Post()
  async createParentCategory(
    @Body() createCategoryDto: CreateCategoryDto, //
  ): Promise<CategoryEntity> {
    return await this.categoryService.createParent(createCategoryDto);
  }

  @ApiCreateSubCategorySwagger('서브 카테고리 생성')
  @Post('/:categoryId/subCategories')
  async createSubCategory(
    @Param('categoryId') categoryId: string,
    @Body() createCategoryDto: CreateCategoryDto, //
  ): Promise<CategoryEntity> {
    return await this.categoryService.createSub(categoryId, createCategoryDto);
  }

  @ApiUpdateCategorySwagger('카테고리 수정(메인,서브)')
  @Put('/:categoryId')
  async updateCategoryOrSub(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return await this.categoryService.update(categoryId, updateCategoryDto);
  }

  @ApiDeleteCategorySwagger('카테고리 삭제(메인,서브)')
  @Delete('/:categoryId')
  async deleteCategoryOrSub(
    @Param('categoryId') categoryId: string, //
  ): Promise<void> {
    return await this.categoryService.delete(categoryId);
  }
}
