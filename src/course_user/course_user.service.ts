import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseUserEntity } from './entities/course-user.entity';

@Injectable()
export class CourseUserService {
  constructor(
    @InjectRepository(CourseUserEntity)
    private readonly courseUserRepository: Repository<CourseUserEntity>,
  ) {}
}
