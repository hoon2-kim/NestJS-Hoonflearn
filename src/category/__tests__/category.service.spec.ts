import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from '@src/category/category.service';
import { CategoryEntity } from '@src/category/entities/category.entity';
import { CreateCategoryDto } from '@src/category/dtos/request/create-category.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateCategoryDto } from '@src/category/dtos/request/update-category.dto';
import {
  mockCategoryRepository,
  mockCreatedMainCategory,
  mockCreatedSubCategory,
  mockCategory,
} from '@src/category/__tests__/__mocks__/category.mock';
import { CategoryResponseDto } from '../dtos/response/category.response.dto';
import { IsNull } from 'typeorm';

describe('CategoryService', () => {
  let categoryService: CategoryService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('[FindAll] 카테고리 전체 조회', () => {
    const mockCategoryList = CategoryResponseDto.from(mockCategory);
    it('카테고리 전체 조회 성공', async () => {
      jest
        .spyOn(mockCategoryRepository, 'find')
        .mockResolvedValue([mockCategory]);

      const result = await categoryService.findAll();

      expect(result).toEqual([mockCategoryList]);
      expect(mockCategoryRepository.find).toBeCalledWith({
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

  describe('[FindOne] - 카테고리 상세조회', () => {
    const categoryId = 'uuid';
    const mockCategoryList = CategoryResponseDto.from(mockCategory);

    it('카테고리 상세 조회 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCategory);

      const result = await categoryService.findOneWithSub(categoryId);

      expect(result).toEqual(mockCategoryList);
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
      const mockCategoryNotMain = mockCategory;
      mockCategory.fk_parent_category_id = 'uuid';

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

  describe('[Create] - 메인 카테고리', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: '메인',
    };

    it('메인 카테고리 생성 성공', async () => {
      jest.spyOn(categoryService, 'findOneByOptions').mockResolvedValue(null);

      jest
        .spyOn(mockCategoryRepository, 'save')
        .mockResolvedValue(mockCreatedMainCategory);

      const result = await categoryService.createParent(createCategoryDto);

      expect(categoryService.findOneByOptions).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.save).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        createCategoryDto,
      );
      expect(result).toEqual(mockCreatedMainCategory);
    });

    it('메인 카테고리 생성 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedMainCategory);

      try {
        await categoryService.createParent(createCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[Create] - 서브 카테고리', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: '서브',
    };

    const categoryId = 'parent-uuid';

    it('서브 카테고리 생성 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedMainCategory);

      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockCategoryRepository, 'save')
        .mockResolvedValue(mockCreatedSubCategory);

      const result = await categoryService.createSub(
        categoryId,
        createCategoryDto,
      );

      expect(categoryService.findOneByOptions).toHaveBeenCalledTimes(2);
      expect(mockCategoryRepository.save).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith({
        ...createCategoryDto,
        parent: { id: categoryId },
      });
      expect(result).toEqual(mockCreatedSubCategory);
    });

    it('서브 카테고리 생성 실패 - 부모 카테고리가 없을 경우(404에러)', async () => {
      jest.spyOn(categoryService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await categoryService.createSub(categoryId, createCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('서브 카테고리 생성 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedSubCategory);

      try {
        await categoryService.createSub(categoryId, createCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[Update] 메인/서브 카테고리 수정', () => {
    const categoryId = 'uuid';
    const updateCategoryDto: UpdateCategoryDto = {
      name: '수정',
    };

    it('메인/서브 카테고리 수정 성공', async () => {
      const updateResult = undefined;

      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedMainCategory)
        .mockResolvedValueOnce(null);

      jest
        .spyOn(mockCategoryRepository, 'save')
        .mockResolvedValue(updateResult);

      const result = await categoryService.update(
        categoryId,
        updateCategoryDto,
      );

      expect(result).toEqual(undefined);
      expect(categoryService.findOneByOptions).toBeCalledTimes(2);
    });

    it('메인/서브 카테고리 수정 실패 - 이름이 이미 존재할 경우(400에러)', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedMainCategory);

      try {
        await categoryService.update(categoryId, updateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('메인/서브 카테고리 수정 실패 - 수정하려는 카테고리가 없는 경우(404에러)', async () => {
      jest.spyOn(categoryService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await categoryService.update(categoryId, updateCategoryDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[Delete] 메인/서브 카테고리 삭제', () => {
    const categoryId = 'uuid';

    it('메인/서브 카테고리 삭제 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedMainCategory);

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
