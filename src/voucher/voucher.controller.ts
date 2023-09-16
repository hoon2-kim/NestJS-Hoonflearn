import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dtos/create-voucher.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  ApiCancelFreeCourseSwagger,
  ApiRegisterFreeCourseSwagger,
} from './voucher.swagger';
import { CourseUserEntity } from 'src/course_user/entities/course-user.entity';

@ApiTags('VOUCHER')
@UseGuards(AtGuard)
@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @ApiRegisterFreeCourseSwagger('무료강의 수강 신청')
  @Post()
  registerFreeCourse(
    @Body() createVoucherDto: CreateVoucherDto,
    @CurrentUser('id') userId: string,
  ): Promise<CourseUserEntity> {
    return this.voucherService.create(createVoucherDto, userId);
  }

  @ApiCancelFreeCourseSwagger('수강 신청한 무료강의 취소')
  @Delete('/:courseId')
  cancelFreeCourse(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.voucherService.delete(courseId, userId);
  }
}
