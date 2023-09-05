import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from '../../entities/category.entity';
import {
  ICategoryNameResponse,
  ICategoryResponse,
  ISubCategoryResponse,
} from '../../interfaces/category.interface';

export class SubCategoryResponseDto implements ISubCategoryResponse {
  @ApiProperty({ description: '서브 카테고리 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '서브 카테고리 이름', type: 'string' })
  name: string;

  @ApiProperty({ description: '부모 카테고리 ID', type: 'string' })
  fk_parent_category_id: string;

  static from(category: CategoryEntity): SubCategoryResponseDto {
    const dto = new SubCategoryResponseDto();
    const { id, name, fk_parent_category_id } = category;

    dto.id = id;
    dto.name = name;
    dto.fk_parent_category_id = fk_parent_category_id;

    return dto;
  }
}

export class CategoryNameResponseDto implements ICategoryNameResponse {
  @ApiProperty({ description: '카테고리 이름', type: 'string' })
  name: string;

  static from(category: CategoryEntity): CategoryNameResponseDto {
    const dto = new CategoryNameResponseDto();

    dto.name = category.name;

    return dto;
  }
}

export class CategoryResponseDto implements ICategoryResponse {
  @ApiProperty({ description: '카테고리 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '카테고리 이름', type: 'string' })
  name: string;

  @ApiProperty({
    description: '서브 카테고리 정보',
    type: SubCategoryResponseDto,
    isArray: true,
  })
  sub_category: ISubCategoryResponse[];

  static from(category: CategoryEntity): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    const { id, name, children } = category;

    dto.id = id;
    dto.name = name;
    dto.sub_category = children?.map((c) => SubCategoryResponseDto.from(c));

    return dto;
  }
}
