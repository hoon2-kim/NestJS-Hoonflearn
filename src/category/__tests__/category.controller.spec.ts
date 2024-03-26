import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '@src/category/category.controller';
import { CategoryService } from '@src/category/category.service';
import {
  mockCreateCategoryDto,
  mockMainCategory,
  mockSubCategory,
  mockUpdateCategoryDto,
} from '@test/__mocks__/mock-data';
import { mockCategoryService } from '@test/__mocks__/mock-service';

const categoryId = 'uuid';
const parentId = 'uuid';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(categoryController).toBeDefined();
    expect(categoryService).toBeDefined();
  });

  describe('[CategoryController.createParent] - 메인 카테고리 생성', () => {
    it('메인 카테고리 생성 성공', async () => {
      jest
        .spyOn(categoryService, 'createParent')
        .mockResolvedValue(mockMainCategory);

      const result = await categoryController.createParentCategory(
        mockCreateCategoryDto,
      );

      expect(categoryService.createParent).toHaveBeenCalled();
      expect(result).toEqual(mockMainCategory);
    });
  });

  describe('[CategoryController.createSubCategory] - 서브 카테고리 생성', () => {
    it('서브 카테고리 생성 성공', async () => {
      jest
        .spyOn(categoryService, 'createSub')
        .mockResolvedValue(mockSubCategory);

      const result = await categoryController.createSubCategory(
        parentId,
        mockCreateCategoryDto,
      );

      expect(categoryService.createSub).toHaveBeenCalled();
      expect(result).toEqual(mockSubCategory);
    });
  });

  describe('[CategoryController.updateCategoryOrSub] - 메인/서브 카테고리 수정', () => {
    it('메인/서브 카테고리 수정 성공', async () => {
      const mockUpdateCategory = Object.assign(
        mockMainCategory,
        mockUpdateCategoryDto,
      );

      jest
        .spyOn(categoryService, 'update')
        .mockResolvedValue(mockUpdateCategory);

      const result = await categoryController.updateCategoryOrSub(
        categoryId,
        mockUpdateCategoryDto,
      );

      expect(categoryService.update).toHaveBeenCalled();
      expect(result).toEqual(mockUpdateCategory);
    });
  });

  describe('[CategoryController.deleteCategoryOrSub] - 메인/서브 카테고리 삭제', () => {
    it('메인/서브 카테고리 삭제 성공', async () => {
      jest.spyOn(categoryService, 'delete').mockResolvedValue(undefined);

      const result = await categoryController.deleteCategoryOrSub(categoryId);

      expect(categoryService.delete).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('[CategoryController.findAllCategories] - 모든 카테고리 조회', () => {
    it('모든 카테고리 조회 성공', async () => {
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
        .spyOn(categoryService, 'findAll')
        .mockResolvedValue(mockCategoryList);

      const result = await categoryController.findAllCategories();

      expect(categoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategoryList);
    });
  });

  describe('[CategoryController.findOneCategoryWithSub] - 카테고리 상세 조회(메인만)', () => {
    it('카테고리 상세 조회 성공', async () => {
      jest
        .spyOn(categoryService, 'findOneWithSub')
        .mockResolvedValue(mockMainCategory);

      const result = await categoryController.findOneCategoryWithSub(
        categoryId,
      );

      expect(categoryService.findOneWithSub).toHaveBeenCalled();
      expect(result).toEqual(mockMainCategory);
    });
  });
});
