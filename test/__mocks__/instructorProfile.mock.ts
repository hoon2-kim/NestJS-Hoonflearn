import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { EFieldOfHopeType } from '@src/instructor/enums/instructor.enum';
import { mockCreatedInstructor } from '@test/__mocks__/user.mock';

export const mockInstructorProfile = {
  id: 'uuid',
  contactEmail: 'a@a.com',
  nameOrBusiness: '가나다',
  fieldOfHope: EFieldOfHopeType.DevProgram,
  aboutMe: '크크크',
  link: '링크',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  deleted_at: null,
  fk_user_id: mockCreatedInstructor.id,
} as InstructorProfileEntity;
