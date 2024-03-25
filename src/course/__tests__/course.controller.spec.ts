import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryCourseEntity } from '@src/category_course/entities/category-course.entitiy';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';
import { CourseController } from '@src/course/course.controller';
import { CourseService } from '@src/course/course.service';
import { CourseListQueryDto } from '@src/course/dtos/course-list.query.dto';
import {
  mockPaidCourse,
  mockInstructor,
  mockCategoryCourse,
  mockMainCategory,
  mockSubCategory,
  mockSection,
  mockLesson,
  mockVideo,
  mockCreateCourseDto,
  mockUpdateCourseDto,
  mockFreeCourse,
} from '@test/__mocks__/mock-data';
import { mockCourseService } from '@test/__mocks__/mock-service';
import { CourseEntity } from '../entities/course.entity';

describe('CourseController', () => {
  let courseController: CourseController;
  let courseService: CourseService;

  const courseId = 'uuid';
  const userId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [{ provide: CourseService, useValue: mockCourseService }],
    }).compile();

    courseController = module.get<CourseController>(CourseController);
    courseService = module.get<CourseService>(CourseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(courseController).toBeDefined();
    expect(courseService).toBeDefined();
  });

  describe('[CourseController.findCourseDetail] - 강의 상세 조회', () => {
    const mockCourseDetail = {
      ...mockPaidCourse,
      instructor: mockInstructor,
      categoriesCourses: [
        {
          id: mockCategoryCourse.id,
          isMain: mockCategoryCourse.isMain,
          parentCategory: mockMainCategory,
          subCategory: mockSubCategory,
        },
      ] as CategoryCourseEntity[],
      section: [
        { ...mockSection, lessons: [{ ...mockLesson, video: mockVideo }] },
      ],
    } as CourseEntity;

    it('조회 성공', async () => {
      jest
        .spyOn(courseService, 'findCourseDetail')
        .mockResolvedValue(mockCourseDetail);

      const result = await courseController.findCourseDetail(courseId);

      expect(result).toEqual(mockCourseDetail);
      expect(courseService.findCourseDetail).toBeCalled();
      expect(courseService.findCourseDetail).toBeCalledWith(courseId);
    });
  });

  describe('[CourseController.getPurchaseStatusByUser] - 강의 구매 여부 반환', () => {
    it('구매했다면 true', async () => {
      jest
        .spyOn(courseService, 'getStatusByUser')
        .mockResolvedValue({ isPurchased: true });

      const result = await courseController.getPurchaseStatusByUser(
        courseId,
        userId,
      );

      expect(result).toEqual({ isPurchased: true });
      expect(courseService.getStatusByUser).toBeCalled();
      expect(courseService.getStatusByUser).toBeCalledWith(courseId, userId);
    });

    it('구매안했다면 false', async () => {
      jest
        .spyOn(courseService, 'getStatusByUser')
        .mockResolvedValue({ isPurchased: false });

      const result = await courseController.getPurchaseStatusByUser(
        courseId,
        userId,
      );

      expect(result).toEqual({ isPurchased: false });
      expect(courseService.getStatusByUser).toBeCalled();
      expect(courseService.getStatusByUser).toBeCalledWith(courseId, userId);
    });

    it('로그인안한 유저라면 false', async () => {
      jest
        .spyOn(courseService, 'getStatusByUser')
        .mockResolvedValue({ isPurchased: false });

      const result = await courseController.getPurchaseStatusByUser(
        courseId,
        null,
      );

      expect(result).toEqual({ isPurchased: false });
      expect(courseService.getStatusByUser).toBeCalled();
      expect(courseService.getStatusByUser).toBeCalledWith(courseId, null);
    });
  });

  describe('[CourseController.getCourseDashBoard] - 강의 대시보드 조회', () => {
    const mockDashBoard = {
      ...mockPaidCourse,
      section: [
        { ...mockSection, lessons: [{ ...mockLesson, video: mockVideo }] },
      ],
    } as CourseEntity;

    it('조회 성공', async () => {
      jest
        .spyOn(courseService, 'getDashBoard')
        .mockResolvedValue(mockDashBoard);

      const result = await courseController.getCourseDashBoard(
        courseId,
        userId,
      );

      expect(result).toEqual(mockDashBoard);
      expect(courseService.getDashBoard).toBeCalled();
      expect(courseService.getDashBoard).toBeCalledWith(courseId, userId);
    });
  });

  describe('[CourseController.findAllCourses] - 강의 전체 조회', () => {
    const query = new CourseListQueryDto();
    const mockCourseList = [
      [
        {
          ...mockPaidCourse,
          instructor: mockInstructor,
        },
        {
          ...mockFreeCourse,
          instructor: mockInstructor,
        },
      ],
      2,
    ] as [CourseEntity[], number];
    const pageMeta = new PageMetaDto({
      pageOptionDto: query,
      itemCount: mockCourseList[1],
    });
    const expectedCourseList = new PageDto(mockCourseList[0], pageMeta);

    it('조회 성공', async () => {
      jest
        .spyOn(courseService, 'findAllCourse')
        .mockResolvedValue(expectedCourseList);

      const result = await courseController.findAllCourses(query);

      expect(result).toEqual(expectedCourseList);
      expect(courseService.findAllCourse).toBeCalled();
      expect(courseService.findAllCourse).toBeCalledWith(
        query,
        undefined,
        undefined,
      );
    });

    it('조회 성공 - 메인카테고리 포함', async () => {
      const mainCategoryId = 'uuid';
      jest
        .spyOn(courseService, 'findAllCourse')
        .mockResolvedValue(expectedCourseList);

      const result = await courseController.findAllCourses(
        query,
        mainCategoryId,
      );

      expect(result).toEqual(expectedCourseList);
      expect(courseService.findAllCourse).toBeCalled();
      expect(courseService.findAllCourse).toBeCalledWith(
        query,
        mainCategoryId,
        undefined,
      );
    });

    it('조회 성공 - 메인카테고리+서브카테고리 포함', async () => {
      const mainCategoryId = 'uuid';
      const subCategoryId = 'uuid';
      jest
        .spyOn(courseService, 'findAllCourse')
        .mockResolvedValue(expectedCourseList);

      const result = await courseController.findAllCourses(
        query,
        mainCategoryId,
        subCategoryId,
      );

      expect(result).toEqual(expectedCourseList);
      expect(courseService.findAllCourse).toBeCalled();
      expect(courseService.findAllCourse).toBeCalledWith(
        query,
        mainCategoryId,
        subCategoryId,
      );
    });
  });

  describe('[CourseController.createCourse] - 강의 생성', () => {
    it('생성 성공', async () => {
      jest.spyOn(courseService, 'create').mockResolvedValue(mockPaidCourse);

      const result = await courseController.createCourse(
        mockCreateCourseDto,
        mockInstructor,
      );

      expect(result).toEqual(mockPaidCourse);
      expect(courseService.create).toBeCalled();
      expect(courseService.create).toBeCalledWith(
        mockCreateCourseDto,
        mockInstructor,
      );
    });
  });

  describe('[CourseController.courseWishAdd] - 강의 찜하기 및 취소', () => {
    it('찜하기 및 취소 성공', async () => {
      jest.spyOn(courseService, 'addOrCancelWish').mockResolvedValue(undefined);

      const result = await courseController.courseWishAdd(courseId, userId);

      expect(result).toBeUndefined();
      expect(courseService.addOrCancelWish).toBeCalled();
      expect(courseService.addOrCancelWish).toBeCalledWith(courseId, userId);
    });
  });

  describe('[CourseController.updateCourse] - 강의 수정', () => {
    it('수정 성공', async () => {
      jest.spyOn(courseService, 'update').mockResolvedValue(undefined);

      const result = await courseController.updateCourse(
        courseId,
        mockUpdateCourseDto,
        mockInstructor,
      );

      expect(result).toBeUndefined();
      expect(courseService.update).toBeCalled();
      expect(courseService.update).toBeCalledWith(
        courseId,
        mockUpdateCourseDto,
        mockInstructor,
      );
    });
  });

  describe('[CourseController.uploadCourseCoverImage] - 강의 썸네일 업로드', () => {
    const file = {
      fieldname: 'avatar',
      originalname: 'pikachu.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('pikachu.jpg'),
      size: 32805,
    } as Express.Multer.File;
    const uploadUrl =
      'https://hoonflearn-s3.s3.amazonaws.com/유저-35eee35c-d1a7-4ca7-aede-df1ae8cfc240/프로필이미지/1697697807403_pikachu.jpg';

    it('업로드 성공', async () => {
      jest.spyOn(courseService, 'uploadImage').mockResolvedValue(uploadUrl);

      const result = await courseController.uploadCourseCoverImage(
        courseId,
        mockInstructor,
        file,
      );

      expect(result).toBe(uploadUrl);
      expect(courseService.uploadImage).toBeCalled();
      expect(courseService.uploadImage).toBeCalledWith(
        courseId,
        mockInstructor,
        file,
      );
    });

    it('업로드 실패 - 파일이 없는 경우(400에러)', async () => {
      try {
        await courseController.uploadCourseCoverImage(
          courseId,
          mockInstructor,
          null,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[CourseController.deleteCourse] - 강의 삭제', () => {
    it('삭제 성공', async () => {
      jest.spyOn(courseService, 'delete').mockResolvedValue(undefined);

      const result = await courseController.deleteCourse(
        courseId,
        mockInstructor,
      );

      expect(result).toBeUndefined();
      expect(courseService.delete).toBeCalled();
      expect(courseService.delete).toBeCalledWith(courseId, mockInstructor);
    });
  });
});
