import { Module } from '@nestjs/common';
import { SectionService } from '@src/section/section.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionEntity } from '@src/section/entities/section.entity';
import { SectionController } from '@src/section/section.controller';
import { CourseModule } from '@src/course/course.module';

@Module({
  imports: [TypeOrmModule.forFeature([SectionEntity]), CourseModule],
  providers: [SectionService],
  controllers: [SectionController],
  exports: [SectionService],
})
export class SectionModule {}
