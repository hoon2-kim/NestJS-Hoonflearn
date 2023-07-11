import { InstructorProfileEntity } from '../entities/instructor-profile.entity';

export interface IInstructorCreateResult {
  access_token: string;
  instructorProfile: InstructorProfileEntity;
}
