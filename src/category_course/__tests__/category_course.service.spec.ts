import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryCourseService } from '@src/category_course/category_course.service';
import { CategoryIdsDto } from '@src/course/dtos/request/create-course.dto';
import {
  mockCategoryCourse,
  mockCategoryCourseRepository,
} from '@test/__mocks__/categoryCourse.mock';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CategoryCourseEntity } from '../entities/category-course.entitiy';

describe('CategoryCourseService', () => {
  let categoryCourseService: CategoryCourseService;
  let categoryCourseRepository: Repository<CategoryCourseEntity>;
  let dataSource: DataSource;

  const mockEntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  } as unknown as EntityManager;
  const mockDataSource = {
    transaction: jest.fn(),
  };
  const courseId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryCourseService,
        {
          provide: getRepositoryToken(CategoryCourseEntity),
          useValue: mockCategoryCourseRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    categoryCourseService = module.get<CategoryCourseService>(
      CategoryCourseService,
    );
    categoryCourseRepository = module.get<Repository<CategoryCourseEntity>>(
      getRepositoryToken(CategoryCourseEntity),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(categoryCourseService).toBeDefined();
    expect(categoryCourseRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('linkCourseToCategories 테스트 - 강의 생성시 중간엔티티(강의-카테고리)에 저장 로직', () => {
    const selectedCategoryIds: CategoryIdsDto[] = [
      { parentCategoryId: 'uuid1', subCategoryId: 'uuid2' },
      { parentCategoryId: 'uuid3', subCategoryId: 'uuid4' },
    ];

    it('저장 성공 - EntityManger없이', async () => {
      jest
        .spyOn(categoryCourseRepository, 'save')
        .mockResolvedValueOnce(mockCategoryCourse[0]);
      jest
        .spyOn(categoryCourseRepository, 'save')
        .mockResolvedValueOnce(mockCategoryCourse[1]);

      const result = await categoryCourseService.linkCourseToCategories(
        selectedCategoryIds,
        courseId,
      );

      expect(result).toEqual(mockCategoryCourse);
      expect(categoryCourseRepository.save).toBeCalledTimes(
        selectedCategoryIds.length,
      );
      for (const category of selectedCategoryIds) {
        const isMain =
          category.subCategoryId === selectedCategoryIds[0].subCategoryId;
        expect(categoryCourseRepository.save).toBeCalledWith({
          fk_parent_category_id: category.parentCategoryId,
          fk_sub_category_id: category.subCategoryId,
          fk_course_id: courseId,
          isMain,
        });
      }
    });

    it('저장 성공 - EntityManger', async () => {
      jest
        .spyOn(mockEntityManager, 'save')
        .mockResolvedValueOnce(mockCategoryCourse[0]);
      jest
        .spyOn(mockEntityManager, 'save')
        .mockResolvedValueOnce(mockCategoryCourse[1]);

      const result = await categoryCourseService.linkCourseToCategories(
        selectedCategoryIds,
        courseId,
        mockEntityManager,
      );

      expect(result).toEqual(mockCategoryCourse);
      expect(mockEntityManager.save).toBeCalledTimes(
        selectedCategoryIds.length,
      );
      for (const category of selectedCategoryIds) {
        const isMain =
          category.subCategoryId === selectedCategoryIds[0].subCategoryId;
        expect(mockEntityManager.save).toBeCalledWith(CategoryCourseEntity, {
          fk_parent_category_id: category.parentCategoryId,
          fk_sub_category_id: category.subCategoryId,
          fk_course_id: courseId,
          isMain,
        });
      }
    });
  });

  describe('updateCourseToCategories 테스트 - 강의 카테고리 수정 시 기존꺼 삭제 후 새로 저장', () => {
    it('성공', async () => {
      const selectedCategoryIds: CategoryIdsDto[] = [
        { parentCategoryId: 'uuid1', subCategoryId: 'uuid2' },
        { parentCategoryId: 'uuid3', subCategoryId: 'uuid4' },
      ];
      const mockDelete = jest.fn().mockResolvedValue({ raw: [], affected: 1 });

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        jest
          .spyOn(categoryCourseService, 'linkCourseToCategories')
          .mockResolvedValue(mockCategoryCourse);

        return await cb({ delete: mockDelete });
      });

      const result = await categoryCourseService.updateCourseToCategories(
        selectedCategoryIds,
        courseId,
      );

      expect(result).toBeUndefined();
      expect(mockDelete).toBeCalledWith(CategoryCourseEntity, {
        fk_course_id: courseId,
      });
    });
  });
});
