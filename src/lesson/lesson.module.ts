import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonEntity } from './entities/lesson.entity';
import { CourseModule } from '../course/course.module';
import { SectionModule } from 'src/section/section.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonEntity]),
    SectionModule,
    CourseModule,
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
