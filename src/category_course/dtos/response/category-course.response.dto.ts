import { ApiProperty } from '@nestjs/swagger';
import { CategoryNameResponseDto } from 'src/category/dtos/response/category.response.dto';
import { ICategoryNameResponse } from 'src/category/interfaces/category.interface';
import { CategoryCourseEntity } from '../../entities/category-course.entitiy';
import { ICategoryCourseMainNameResponse } from '../../interfaces/category-course.interface';

export class CategoryCourseMainNameResponseDto
  implements ICategoryCourseMainNameResponse
{
  @ApiProperty({ description: '메인 카테고리', type: CategoryNameResponseDto })
  mainCategory: ICategoryNameResponse;

  @ApiProperty({ description: '서브 카테고리', type: CategoryNameResponseDto })
  subCategory: ICategoryNameResponse;

  static from(
    categoryCourse: CategoryCourseEntity,
  ): CategoryCourseMainNameResponseDto {
    const dto = new CategoryCourseMainNameResponseDto();
    const { parentCategory, subCategory } = categoryCourse;

    dto.mainCategory = CategoryNameResponseDto.from(parentCategory);
    dto.subCategory = CategoryNameResponseDto.from(subCategory);

    return dto;
  }
}
