import { Module } from '@nestjs/common';
import { VoucherService } from '@src/voucher/voucher.service';
import { VoucherController } from '@src/voucher/voucher.controller';
import { CourseUserModule } from '@src/course_user/course-user.module';
import { CourseModule } from '@src/course/course.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseUserEntity]),
    CourseUserModule,
    CourseModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
