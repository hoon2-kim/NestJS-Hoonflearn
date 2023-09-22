import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreateCourseDto } from '@src/course/dtos/request/create-course.dto';

@Injectable()
export class CoursePriceValidationPipe implements PipeTransform {
  transform(value: CreateCourseDto, metadata: ArgumentMetadata) {
    // console.log('value:', value); // dto
    const parsedPrice = value?.price;

    if (parsedPrice < 0) {
      throw new BadRequestException('강의 가격은 음수가 되면 안됩니다.');
    }

    if (parsedPrice > 0 && parsedPrice < 10000) {
      throw new BadRequestException('유료 강의의 가격은 최소 만원 이상입니다.');
    }

    if (parsedPrice % 1000 !== 0) {
      throw new BadRequestException(
        '유료 강의의 가격은 1000원 단위여야 합니다.',
      );
    }

    return value;
  }
}
