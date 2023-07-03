import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAllCategories() {
    return this.categoryService.findAll();
  }

  @Get('/:categoryId')
  findOneCategoryWithSub(
    @Param('categoryId') categoryId: string, //
  ) {
    return this.categoryService.findOne(categoryId);
  }

  @Post()
  createParentCategory(
    @Body() createCategoryDto: CreateCategoryDto, //
  ) {
    return this.categoryService.createParent(createCategoryDto);
  }

  @Post('/:categoryId/subCategories')
  createSubCategory(
    @Param('categoryId') categoryId: string,
    @Body() createCategoryDto: CreateCategoryDto, //
  ) {
    return this.categoryService.createSub(categoryId, createCategoryDto);
  }

  @Put('/:categoryId')
  updateCategoryOrSub(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto);
  }

  @Delete('/:categoryId')
  deleteCategoryOrSub(
    @Param('categoryId') categoryId: string, //
  ) {
    return this.categoryService.delete(categoryId);
  }
}
