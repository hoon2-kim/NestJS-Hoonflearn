import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';

export interface IInstructorCreateResult {
  access_token: string;
  instructorProfile: InstructorProfileEntity;
}
