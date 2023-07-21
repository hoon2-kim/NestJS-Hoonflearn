import { SetMetadata } from '@nestjs/common';

export const META_ROLE = 'roles';
export const COURSE_OWN = 'own';

export const Roles = (...args: string[]) => {
  return SetMetadata(META_ROLE, args);
};
