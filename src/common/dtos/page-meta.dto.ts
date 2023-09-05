import { ApiProperty } from '@nestjs/swagger';
import { PageOptionDto } from './page-option.dto';

interface IPageMetaDtoParam {
  pageOptionDto: PageOptionDto;
  itemCount: number;
}

export class PageMetaDto {
  @ApiProperty({ description: '페이저 번호', type: 'number' })
  readonly page: number;

  @ApiProperty({ description: '페이지당 아이템 수', type: 'number' })
  readonly take: number;

  @ApiProperty({ description: '아이템 총 개수', type: 'number' })
  readonly itemCount: number;

  @ApiProperty({ description: '페이지 총 수', type: 'number' })
  readonly pageCount: number;

  @ApiProperty({ description: '이전 페이지 여부', type: 'boolean' })
  readonly hasPreviousPage: boolean;

  @ApiProperty({ description: '다음 페이지 여부', type: 'boolean' })
  readonly hasNextPage: boolean;

  constructor({ pageOptionDto, itemCount }: IPageMetaDtoParam) {
    this.page = pageOptionDto.page;
    this.take = pageOptionDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
