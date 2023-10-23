import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from '@src/category/category.service';
import { CategoryEntity } from '@src/category/entities/category.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  mockCategoryRepository,
  mockCategoryList,
  mockCreatedCategory,
  mockCreateCategoryDto,
  mockUpdateCategoryDto,
} from '@test/__mocks__/category.mock';
import { CategoryResponseDto } from '@src/category/dtos/response/category.response.dto';
import { IsNull, Repository } from 'typeorm';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository: Repository<CategoryEntity>;

  const categoryId = 'uuid';

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
    const mockCategoryResponse = CategoryResponseDto.from(mockCategoryList);
    it('카테고리 전체 조회 성공', async () => {
      jest
        .spyOn(mockCategoryRepository, 'find')
        .mockResolvedValue([mockCategoryList]);

      const result = await categoryService.findAll();

      expect(result).toEqual([mockCategoryResponse]);
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
    const mockCategoryResponse = CategoryResponseDto.from(mockCategoryList);

    it('카테고리 상세 조회 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCategoryList);

      const result = await categoryService.findOneWithSub(categoryId);

      expect(result).toEqual(mockCategoryResponse);
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
      const mockCategoryNotMain = mockCreatedCategory;
      mockCategoryNotMain.fk_parent_category_id = 'uuid';

      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCategoryNotMain);

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
        .mockResolvedValue(mockCreatedCategory);

      const result = await categoryService.createParent(mockCreateCategoryDto);

      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith(
        mockCreateCategoryDto,
      );

      expect(result).toEqual(mockCreatedCategory);
    });

    it('메인 카테고리 생성 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCategory);

      try {
        await categoryService.createParent(mockCreateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[서브 카테고리 생성]', () => {
    const parentId = 'parent-uuid';
    const mockCreatedSubCategory = mockCreatedCategory;
    mockCreatedSubCategory.fk_parent_category_id = categoryId;

    it('서브 카테고리 생성 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedCategory)
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockCategoryRepository, 'save')
        .mockResolvedValue(mockCreatedSubCategory);

      const result = await categoryService.createSub(
        parentId,
        mockCreateCategoryDto,
      );

      expect(categoryService.findOneByOptions).toHaveBeenCalledTimes(2);
      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith({
        ...mockCreateCategoryDto,
        parent: { id: parentId },
      });
      expect(result).toEqual(mockCreatedSubCategory);
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
        .mockResolvedValue(mockCreatedSubCategory);

      try {
        await categoryService.createSub(categoryId, mockCreateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[메인/서브 카테고리 수정]', () => {
    const mockUpdateResult = { message: '수정 성공' };

    it('메인/서브 카테고리 수정 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedCategory)
        .mockResolvedValueOnce(null);

      jest.spyOn(mockCategoryRepository, 'save').mockResolvedValue(undefined);

      const result = await categoryService.update(
        categoryId,
        mockUpdateCategoryDto,
      );

      expect(result).toEqual(mockUpdateResult);
      expect(categoryService.findOneByOptions).toBeCalledTimes(2);
    });

    it('메인/서브 카테고리 수정 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCategory);

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
    it('메인/서브 카테고리 삭제 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCategory);

      jest
        .spyOn(mockCategoryRepository, 'delete')
        .mockResolvedValue({ affected: 1 });

      const result = await categoryService.delete(categoryId);

      expect(result).toBe(true);
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
});
