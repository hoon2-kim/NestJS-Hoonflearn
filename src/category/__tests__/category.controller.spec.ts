import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '@src/category/category.controller';
import { CategoryService } from '@src/category/category.service';
import { CategoryResponseDto } from '@src/category/dtos/response/category.response.dto';
import {
  mockCreatedCategory,
  mockCategoryService,
  mockCategoryList,
  mockCreateCategoryDto,
  mockUpdateCategoryDto,
} from '@test/__mocks__/category.mock';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  const categoryId = 'uuid';

  const mockCategoryResponse = CategoryResponseDto.from(mockCategoryList);

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
        .mockResolvedValue(mockCreatedCategory);

      const result = await categoryController.createParentCategory(
        mockCreateCategoryDto,
      );

      expect(categoryService.createParent).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedCategory);
    });
  });

  describe('[CategoryController.createSubCategory] - 서브 카테고리 생성', () => {
    it('서브 카테고리 생성 성공', async () => {
      const parentId = 'uuid';
      const mockCreatedSubCategory = mockCreatedCategory;
      mockCreatedSubCategory.fk_parent_category_id = parentId;

      jest
        .spyOn(categoryService, 'createSub')
        .mockResolvedValue(mockCreatedSubCategory);

      const result = await categoryController.createSubCategory(
        parentId,
        mockCreateCategoryDto,
      );

      expect(categoryService.createSub).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedSubCategory);
    });
  });

  describe('[CategoryController.updateCategoryOrSub] - 메인/서브 카테고리 수정', () => {
    it('메인/서브 카테고리 수정 성공', async () => {
      const mockUpdateResult = { message: '수정 성공' };

      jest.spyOn(categoryService, 'update').mockResolvedValue(mockUpdateResult);

      const result = await categoryController.updateCategoryOrSub(
        categoryId,
        mockUpdateCategoryDto,
      );

      expect(categoryService.update).toHaveBeenCalled();
      expect(result).toEqual(mockUpdateResult);
    });
  });

  describe('[CategoryController.deleteCategoryOrSub] - 메인/서브 카테고리 삭제', () => {
    it('메인/서브 카테고리 삭제 성공', async () => {
      jest.spyOn(categoryService, 'delete').mockResolvedValue(true);

      const result = await categoryController.deleteCategoryOrSub(categoryId);

      expect(categoryService.delete).toHaveBeenCalled();
      expect(result).toEqual(true);
    });
  });

  describe('[CategoryController.findAll] - 모든 카테고리 조회', () => {
    it('모든 카테고리 조회 성공', async () => {
      jest
        .spyOn(categoryService, 'findAll')
        .mockResolvedValue([mockCategoryResponse]);

      const result = await categoryController.findAllCategories();

      expect(categoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCategoryResponse]);
    });
  });

  describe('[CategoryController.findAll] - 모든 카테고리 조회', () => {
    it('모든 카테고리 조회 성공', async () => {
      const categoryId = 'uuid';

      jest
        .spyOn(categoryService, 'findOneWithSub')
        .mockResolvedValue(mockCategoryResponse);

      const result = await categoryController.findOneCategoryWithSub(
        categoryId,
      );

      expect(categoryService.findOneWithSub).toHaveBeenCalled();
      expect(result).toEqual(mockCategoryResponse);
    });
  });
});
