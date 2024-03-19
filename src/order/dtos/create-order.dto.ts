import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: 'imp_511932925806',
    description: 'IAMPORT 결제 후 프론트엔드로 부터 받은 imp_uid',
  })
  @IsString()
  @IsNotEmpty()
  imp_uid: string;

  @ApiProperty({ description: '결제 된 금액' })
  @IsInt()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: [
      'b0d2623e-ab86-4112-85f5-5c5edd179c20',
      '943b0879-45af-4735-bbe0-9ea01fced254',
    ],
    description: '결제 된 강의 ID 혹은 ID들',
  })
  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  courseIds: string[];
}
