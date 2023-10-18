import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '@src/category/category.controller';
import { CategoryService } from '@src/category/category.service';
import { CreateCategoryDto } from '@src/category/dtos/request/create-category.dto';
import { UpdateCategoryDto } from '@src/category/dtos/request/update-category.dto';
import { CategoryResponseDto } from '@src/category/dtos/response/category.response.dto';
import {
  mockCategory,
  mockCategoryService,
  mockCategoryWithSub,
} from '@test/__mocks__/category.mock';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  const mockCategoryLists = CategoryResponseDto.from(mockCategoryWithSub());

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
      const createCategoryDto: CreateCategoryDto = { name: '메인' };

      jest
        .spyOn(categoryService, 'createParent')
        .mockResolvedValue(mockCategory());

      const result = await categoryController.createParentCategory(
        createCategoryDto,
      );

      expect(categoryService.createParent).toHaveBeenCalled();
      expect(result).toEqual(mockCategory());
    });
  });

  describe('[CategoryController.createSubCategory] - 서브 카테고리 생성', () => {
    it('서브 카테고리 생성 성공', async () => {
      const createCategoryDto: CreateCategoryDto = { name: '서브' };
      const categoryId = 'uuid';
      const mockSubCategory = mockCategory();
      mockSubCategory.fk_parent_category_id = categoryId;

      jest
        .spyOn(categoryService, 'createSub')
        .mockResolvedValue(mockSubCategory);

      const result = await categoryController.createSubCategory(
        categoryId,
        createCategoryDto,
      );

      expect(categoryService.createSub).toHaveBeenCalled();
      expect(result).toEqual(mockSubCategory);
    });
  });

  describe('[CategoryController.updateCategoryOrSub] - 메인/서브 카테고리 수정', () => {
    it('메인/서브 카테고리 수정 성공', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: '수정' };
      const categoryId = 'uuid';

      jest.spyOn(categoryService, 'update').mockResolvedValue(undefined);

      const result = await categoryController.updateCategoryOrSub(
        categoryId,
        updateCategoryDto,
      );

      expect(categoryService.update).toHaveBeenCalled();
      expect(result).toEqual(undefined);
    });
  });

  describe('[CategoryController.deleteCategoryOrSub] - 메인/서브 카테고리 삭제', () => {
    it('메인/서브 카테고리 삭제 성공', async () => {
      const categoryId = 'uuid';

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
        .mockResolvedValue([mockCategoryLists]);

      const result = await categoryController.findAllCategories();

      expect(categoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCategoryLists]);
    });
  });

  describe('[CategoryController.findAll] - 모든 카테고리 조회', () => {
    it('모든 카테고리 조회 성공', async () => {
      const categoryId = 'uuid';

      jest
        .spyOn(categoryService, 'findOneWithSub')
        .mockResolvedValue(mockCategoryLists);

      const result = await categoryController.findOneCategoryWithSub(
        categoryId,
      );

      expect(categoryService.findOneWithSub).toHaveBeenCalled();
      expect(result).toEqual(mockCategoryLists);
    });
  });
});
