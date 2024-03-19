import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from '@src/category/dtos/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
