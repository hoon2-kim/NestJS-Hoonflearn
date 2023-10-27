import { CreateVoucherDto } from '@src/voucher/dtos/create-voucher.dto';

export const mockCreateVoucherDto: CreateVoucherDto = {
  courseId: 'uuid',
};

export const mockCourseService = {
  findOneByOptions: jest.fn(),
  updateCourseStudents: jest.fn(),
};

export const mockCourseUserService = {
  findOneByOptions: jest.fn(),
  saveFreeCourseUserRepo: jest.fn(),
  cancelFreeCourseUserRepo: jest.fn(),
};

export const mockVoucherService = {
  create: jest.fn(),
  delete: jest.fn(),
};
