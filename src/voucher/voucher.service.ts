import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from 'src/course/course.service';
import { CourseUserService } from 'src/course_user/course-user.service';
import { CourseUserEntity } from 'src/course_user/entities/course-user.entity';
import { ECouresUserType } from 'src/course_user/enums/course-user.enum';
import { CreateVoucherDto } from './dtos/create-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(
    private readonly courseService: CourseService,
    private readonly couresUserService: CourseUserService,
  ) {}

  async create(
    createVoucherDto: CreateVoucherDto,
    userId: string,
  ): Promise<CourseUserEntity> {
    const { courseId } = createVoucherDto;

    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의는 존재하지 않습니다.');
    }

    if (course.price !== 0) {
      throw new BadRequestException('해당 강의는 무료 강의가 아닙니다.');
    }

    const isRegister = await this.couresUserService.findOneByOptions({
      where: {
        fk_course_id: courseId,
        fk_user_id: userId,
      },
    });

    if (isRegister) {
      throw new BadRequestException('이미 등록하신 강의입니다.');
    }

    return await this.couresUserService.saveFreeCourseUserRepo(
      courseId,
      userId,
    );
  }

  async delete(courseId: string, userId: string): Promise<boolean> {
    const courseUser = await this.couresUserService.findOneByOptions({
      where: { fk_course_id: courseId, fk_user_id: userId },
    });

    if (!courseUser) {
      throw new NotFoundException('등록하지 않으셨습니다.');
    }

    if (courseUser.type !== ECouresUserType.Free) {
      throw new BadRequestException('무료 강의가 아닙니다.');
    }

    const result = await this.couresUserService.cancelFreeCourseUserRepo(
      courseUser.id,
    );

    return result.affected ? true : false;
  }
}
