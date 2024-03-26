import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from '@src/category/category.service';
import { CategoryEntity } from '@src/category/entities/category.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { CategoryIdsDto } from '@src/course/dtos/create-course.dto';
import { mockCategoryRepository } from '@test/__mocks__/mock-repository';
import {
  mockCreateCategoryDto,
  mockMainCategory,
  mockSubCategory,
  mockUpdateCategoryDto,
} from '@test/__mocks__/mock-data';

const categoryId = 'uuid';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository: Repository<CategoryEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<Repository<CategoryEntity>>(
      getRepositoryToken(CategoryEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
    expect(categoryRepository).toBeDefined();
  });

  describe('[카테고리 전체 조회]', () => {
    it('카테고리 전체 조회 성공', async () => {
      const mockCategoryList = [
        {
          ...mockMainCategory,
          children: [
            {
              ...mockSubCategory,
            },
          ],
        },
      ];

      jest
        .spyOn(mockCategoryRepository, 'find')
        .mockResolvedValue(mockCategoryList);

      const result = await categoryService.findAll();

      expect(result).toEqual(mockCategoryList);
      expect(categoryRepository.find).toBeCalledWith({
        where: {
          parent: IsNull(),
        },
        relations: {
          children: true,
        },
        order: {
          name: 'asc',
          children: {
            name: 'asc',
          },
        },
      });
    });
  });

  describe('[카테고리 상세조회]', () => {
    it('카테고리 상세 조회 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockMainCategory);

      const result = await categoryService.findOneWithSub(categoryId);

      expect(result).toEqual(mockMainCategory);
      expect(categoryService.findOneByOptions).toBeCalledWith({
        where: {
          id: categoryId,
        },
        relations: {
          children: true,
        },
        order: {
          children: {
            name: 'ASC',
          },
        },
      });
    });

    it('카테고리 상세 조회 실패 - 해당 카테고리가 없는 경우(404에러)', async () => {
      jest.spyOn(categoryService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await categoryService.findOneWithSub(categoryId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('카테고리 상세 조회 실패 - 해당 카테고리가 메인 카테고리가 아닌 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockSubCategory);

      try {
        await categoryService.findOneWithSub(categoryId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[메인 카테고리 생성]', () => {
    it('메인 카테고리 생성 성공', async () => {
      jest
        .spyOn(mockCategoryRepository, 'save')
        .mockResolvedValue(mockMainCategory);

      const result = await categoryService.createParent(mockCreateCategoryDto);

      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith(
        mockCreateCategoryDto,
      );

      expect(result).toEqual(mockMainCategory);
    });

    it('메인 카테고리 생성 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockMainCategory);

      try {
        await categoryService.createParent(mockCreateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[서브 카테고리 생성]', () => {
    const parentId = 'parent-uuid';
    const categoryId = 'uuid';

    it('서브 카테고리 생성 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockSubCategory)
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockCategoryRepository, 'save')
        .mockResolvedValue(mockSubCategory);

      const result = await categoryService.createSub(
        parentId,
        mockCreateCategoryDto,
      );

      expect(result).toEqual(mockSubCategory);
      expect(categoryService.findOneByOptions).toHaveBeenCalledTimes(2);
      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith({
        ...mockCreateCategoryDto,
        parent: { id: parentId },
      });
    });

    it('서브 카테고리 생성 실패 - 부모 카테고리가 없을 경우(404에러)', async () => {
      jest.spyOn(categoryService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await categoryService.createSub(categoryId, mockCreateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('서브 카테고리 생성 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockSubCategory);

      try {
        await categoryService.createSub(categoryId, mockCreateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[메인/서브 카테고리 수정]', () => {
    it('메인/서브 카테고리 수정 성공', async () => {
      const mockUpdateCategory = Object.assign(
        mockMainCategory,
        mockUpdateCategoryDto,
      );

      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockMainCategory)
        .mockResolvedValueOnce(null);

      jest
        .spyOn(categoryRepository, 'save')
        .mockResolvedValue(mockUpdateCategory);

      const result = await categoryService.update(
        categoryId,
        mockUpdateCategoryDto,
      );

      expect(result).toEqual(mockUpdateCategory);
      expect(categoryService.findOneByOptions).toBeCalledTimes(2);
      expect(categoryRepository.save).toBeCalledWith(
        expect.objectContaining(mockUpdateCategory),
      );
    });

    it('메인/서브 카테고리 수정 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockMainCategory)
        .mockResolvedValueOnce(mockMainCategory);

      try {
        await categoryService.update(categoryId, mockUpdateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('메인/서브 카테고리 수정 실패 - 수정하려는 카테고리가 없는 경우(404에러)', async () => {
      jest.spyOn(categoryService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await categoryService.update(categoryId, mockUpdateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[메인/서브 카테고리 삭제]', () => {
    const categoryId = 'uuid';

    it('메인/서브 카테고리 삭제 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockMainCategory);

      jest
        .spyOn(mockCategoryRepository, 'delete')
        .mockResolvedValue({ affected: 1 });

      const result = await categoryService.delete(categoryId);

      expect(result).toBeUndefined();
      expect(mockCategoryRepository.delete).toBeCalledWith({ id: categoryId });
    });

    it('메인/서브 카테고리 삭제 실패 - 해당 카테고리가 없는경우(404에러)', async () => {
      jest.spyOn(categoryService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await categoryService.delete(categoryId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('validateCategory 테스트 - 카테고리 검증 로직', () => {
    const mockManager = {
      findOne: jest.fn(),
    } as unknown as EntityManager;
    const selectedCategoryIds: CategoryIdsDto[] = [
      {
        parentCategoryId: mockMainCategory.id,
        subCategoryId: mockSubCategory.id,
      },
    ];
    const parentCategoryIds = selectedCategoryIds.map(
      (c) => c.parentCategoryId,
    );
    const subCategoryIds = selectedCategoryIds.map((c) => c.subCategoryId);

    // TODO: 리팩토링
    it('검증 성공 - 트랜잭션 없이', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockMainCategory)
        .mockResolvedValueOnce(mockSubCategory);

      const result = await categoryService.validateCategory(
        selectedCategoryIds,
      );

      expect(result).toBeUndefined();
      expect(categoryService.findOneByOptions).toBeCalledTimes(
        parentCategoryIds.length + subCategoryIds.length,
      );
    });

    it('검증 성공 - 트랜잭션', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockMainCategory)
        .mockResolvedValueOnce(mockSubCategory);

      const result = await categoryService.validateCategory(
        selectedCategoryIds,
        mockManager,
      );

      expect(result).toBeUndefined();
      expect(categoryService.findOneByOptions).toBeCalledTimes(
        parentCategoryIds.length + subCategoryIds.length,
      );
    });

    it('검증 실패 - 메인 카테고리가 존재하지 않는 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(null);

      try {
        await categoryService.validateCategory(
          selectedCategoryIds,
          mockManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('검증 실패 - parentCategoryId값에 넣은 값이 메인 카테고리가 아닌 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockSubCategory);

      try {
        await categoryService.validateCategory(
          selectedCategoryIds,
          mockManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('검증 실패 - parentCategoryId값에 넣은 값이 메인 카테고리가 아닌 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockSubCategory);

      try {
        await categoryService.validateCategory(
          selectedCategoryIds,
          mockManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('검증 실패 - 서브 카테고리가 존재하지 않는 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockMainCategory)
        .mockResolvedValueOnce(null);

      try {
        await categoryService.validateCategory(
          selectedCategoryIds,
          mockManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('검증 실패 - subCategoryId에 메인 카테고리를 넣은 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockMainCategory)
        .mockResolvedValueOnce(mockMainCategory);

      try {
        await categoryService.validateCategory(
          selectedCategoryIds,
          mockManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('검증 실패 - 서브 카테고리와 메인 카테고리가 일치하지않는 경우(400에러)', async () => {
      const mockInvalidCategory = {
        ...mockSubCategory,
        fk_parent_category_id: 'invalid',
      };

      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockMainCategory)
        .mockResolvedValueOnce(mockInvalidCategory);

      try {
        await categoryService.validateCategory(
          selectedCategoryIds,
          mockManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
