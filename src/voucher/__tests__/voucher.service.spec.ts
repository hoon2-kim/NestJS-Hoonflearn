import { Test, TestingModule } from '@nestjs/testing';
import { CourseUserService } from '@src/course_user/course-user.service';
import { VoucherService } from '@src/voucher/voucher.service';
import { DataSource } from 'typeorm';
import { CourseService } from '@src/course/course.service';
import {
  mockCourseService,
  mockCourseUserService,
  mockCreateVoucherDto,
} from '@test/__mocks__/voucher.mock';
import { mockCreatedCourse } from '@test/__mocks__/course.mock';
import {
  mockCreatedCourseUserWithFree,
  mockCreatedCourseUserWithPaid,
} from '@test/__mocks__/courseUser.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VoucherService', () => {
  let voucherService: VoucherService;
  let courseService: CourseService;
  let courseUserService: CourseUserService;
  let dataSource: DataSource;

  const mockDataSource = {
    transaction: jest.fn(),
  };
  const userId = 'uuid';
  const courseId = 'uuid';
  const mockCreatedFreeCourse = { ...mockCreatedCourse, price: 0 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: CourseService,
          useValue: mockCourseService,
        },
        { provide: CourseUserService, useValue: mockCourseUserService },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    voucherService = module.get<VoucherService>(VoucherService);
    courseService = module.get<CourseService>(CourseService);
    courseUserService = module.get<CourseUserService>(CourseUserService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(voucherService).toBeDefined();
    expect(courseService).toBeDefined();
    expect(courseUserService).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('[무료 강의 신청]', () => {
    it('신청 성공', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedFreeCourse);

      jest.spyOn(courseUserService, 'findOneByOptions').mockResolvedValue(null);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const result = jest
          .spyOn(courseUserService, 'saveFreeCourseUserRepo')
          .mockResolvedValue(mockCreatedCourseUserWithFree);

        jest
          .spyOn(courseService, 'updateCourseStudents')
          .mockResolvedValue(undefined);

        return await cb(result);
      });

      const result = await voucherService.create(mockCreateVoucherDto, userId);

      expect(result).toEqual(mockCreatedCourseUserWithFree);
      expect(courseUserService.saveFreeCourseUserRepo).toBeCalledTimes(1);
      expect(courseService.updateCourseStudents).toBeCalledTimes(1);
    });

    it('신청 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await voucherService.create(mockCreateVoucherDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(courseUserService.saveFreeCourseUserRepo).toBeCalledTimes(0);
        expect(courseService.updateCourseStudents).toBeCalledTimes(0);
      }
    });

    it('신청 실패 - 무료 강의가 아닌 경우(400에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);

      try {
        await voucherService.create(mockCreateVoucherDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(courseUserService.saveFreeCourseUserRepo).toBeCalledTimes(0);
        expect(courseService.updateCourseStudents).toBeCalledTimes(0);
      }
    });

    it('신청 실패 - 이미 등록한 경우(400에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedFreeCourse);

      jest
        .spyOn(courseUserService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourseUserWithFree);

      try {
        await voucherService.create(mockCreateVoucherDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(courseUserService.saveFreeCourseUserRepo).toBeCalledTimes(0);
        expect(courseService.updateCourseStudents).toBeCalledTimes(0);
      }
    });
  });

  describe('[무료 강의 신청 취소]', () => {
    it('신청 취소 성공', async () => {
      jest
        .spyOn(courseUserService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourseUserWithFree);

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const result = jest
          .spyOn(courseUserService, 'cancelFreeCourseUserRepo')
          .mockResolvedValue({ raw: [], affected: 1 });

        jest
          .spyOn(courseService, 'updateCourseStudents')
          .mockResolvedValue(undefined);

        return await cb(result);
      });

      const result = await voucherService.delete(courseId, userId);

      expect(result).toBe(true);
      expect(courseUserService.cancelFreeCourseUserRepo).toBeCalledTimes(1);
      expect(courseService.updateCourseStudents).toBeCalledTimes(1);
    });

    it('신청 취소 실패 - 등록하지 않았던 경우(404에러)', async () => {
      jest.spyOn(courseUserService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await voucherService.delete(courseId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(courseUserService.cancelFreeCourseUserRepo).toBeCalledTimes(0);
        expect(courseService.updateCourseStudents).toBeCalledTimes(0);
      }
    });

    it('신청 취소 실패 - 무료 강의가 아닌 경우(400에러)', async () => {
      jest
        .spyOn(courseUserService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourseUserWithPaid);

      try {
        await voucherService.delete(courseId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(courseUserService.cancelFreeCourseUserRepo).toBeCalledTimes(0);
        expect(courseService.updateCourseStudents).toBeCalledTimes(0);
      }
    });
  });
});
