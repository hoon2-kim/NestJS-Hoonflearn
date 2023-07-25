import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CourseWishEntity } from './entities/course-wish.entity';

@Injectable()
export class CourseWishService {
  constructor(
    @InjectRepository(CourseWishEntity)
    private readonly courseWishRepository: Repository<CourseWishEntity>,
  ) {}

  async findOneByOptions(options: FindOneOptions<CourseWishEntity>) {
    const courseWish: CourseWishEntity | null =
      await this.courseWishRepository.findOne(options);

    return courseWish;
  }

  async addWish(courseId: string, userId: string) {
    await this.courseWishRepository.save({
      fk_course_id: courseId,
      fk_user_id: userId,
    });
  }

  async cancelWish(courseId: string, userId: string) {
    await this.courseWishRepository.delete({
      fk_course_id: courseId,
      fk_user_id: userId,
    });
  }
}
