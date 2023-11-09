import {
  CreateUserDto,
  NicknameDto,
} from '@src/user/dtos/request/create-user.dto';
import { UpdateUserDto } from '@src/user/dtos/request/update-user.dto';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';

export const mockCreateUserDto: CreateUserDto = {
  email: 'user@user.com',
  nickname: '닉네임',
  password: '1234',
  phone: '01012341234',
};

export const mockUpdateUserDto: UpdateUserDto = {
  description: '자기소개',
  nickname: '닉네임 수정',
};

export const mockNickNameDto: NicknameDto = {
  nickname: '닉네임',
};

export const mockCreatedUser: UserEntity = {
  id: 'uuid',
  email: 'user@user.com',
  phone: '01011111111',
  nickname: '유저',
  password: '$2a$10$1xClQe8THgUp7uUqkNibluDgzDYwBTSvEBIDdkHh0V3Fnx0F8SOzW',
  description: null,
  profileAvatar: null,
  deleted_at: null,
  role: ERoleType.User,
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
};

export const mockUserProfile = {
  id: 'uuid',
  email: 'user@user.com',
  nickname: '유저',
  description: '자기소개',
  phone: '01011111111',
  profileAvatar: '이미지주소',
  role: ERoleType.User,
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
} as UserEntity;

export const mockCreatedInstructor: UserEntity = {
  id: 'uuid',
  email: 'ins@ins.com',
  nickname: '강사',
  role: ERoleType.Instructor,
  phone: '01011111111',
  profileAvatar: null,
  description: '자기소개',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  password: '$2a$10$byo7Q5qA4f/d5kRe30FbX.wSs12O6hvJuREknY0JLj0sDeCBQqaWW',
  deleted_at: null,
};

export const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  update: jest.fn(),
};

export const mockInstructorProfileRepository = {
  findOne: jest.fn(),
  softDelete: jest.fn(),
};

export const mockAwsS3Service = {
  deleteS3Object: jest.fn(),
  uploadFileToS3: jest.fn(),
};

export const mockCartService = {
  removeCart: jest.fn(),
};

export const mockUserService = {
  getProfile: jest.fn(),
  create: jest.fn(),
  checkNick: jest.fn(),
  update: jest.fn(),
  upload: jest.fn(),
  delete: jest.fn(),
};

export const mockQuestionService = {
  findMyQuestions: jest.fn(),
};

export const mockCourseWishService = {
  findWishCoursesByUser: jest.fn(),
};

export const mockCourseUserService = {
  findMyCourses: jest.fn(),
};
