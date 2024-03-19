import { PartialType } from '@nestjs/swagger';
import { CreateInstructorDto } from '@src/instructor/dtos/create-instructor.dto';

export class UpdateInstructorDto extends PartialType(CreateInstructorDto) {
  // @IsOptional()
  // contactEmail?: string;
  // @IsOptional()
  // nameOrBusiness?: string;
  // @IsOptional()
  // fieldOfHope?: FieldOfHopeType;
  // @IsOptional()
  // aboutMe?: string;
  // @IsOptional()
  // link?: string;
}
