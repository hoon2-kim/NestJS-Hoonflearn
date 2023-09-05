import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { CourseUserModule } from 'src/course_user/course-user.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [CourseUserModule, CourseModule],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
