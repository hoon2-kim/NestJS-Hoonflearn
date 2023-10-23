import { CreateCategoryDto } from '@src/category/dtos/request/create-category.dto';
import { UpdateCategoryDto } from '@src/category/dtos/request/update-category.dto';
import { CategoryEntity } from '@src/category/entities/category.entity';

export const mockCreateCategoryDto: CreateCategoryDto = {
  name: '카테고리',
};

export const mockUpdateCategoryDto: UpdateCategoryDto = {
  name: '수정',
};

export const mockCreatedCategory = {
  id: 'uuid',
  name: '카테고리',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_parent_category_id: null,
} as CategoryEntity;

export const mockCategoryList: CategoryEntity = {
  id: 'uuid',
  name: '카테고리',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_parent_category_id: null,
  children: [
    {
      id: 'uuid2',
      name: '이름2',
      fk_parent_category_id: 'uuid',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
    } as CategoryEntity,
    {
      id: 'uuid3',
      name: '이름3',
      fk_parent_category_id: 'uuid',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
    } as CategoryEntity,
  ],
};

export const mockCategoryRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

export const mockCategoryService = {
  findAll: jest.fn(),
  findOneWithSub: jest.fn(),
  createParent: jest.fn(),
  createSub: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// export const mockCategoryRepository1 = {
//   createQueryBuilder: jest.fn().mockReturnValue({
//     where: jest.fn().mockReturnThis(), // this는 createQueryBuilder를 가리킨다.
//     leftJoinAndSelect: jest.fn().mockReturnThis(),
//     orderBy: jest.fn().mockReturnThis(),
//     getOne: jest.fn().mockReturnThis(),
//   }),
//   find: jest.fn(),
//   findOne: jest.fn(),
//   save: jest.fn(),
//   delete: jest.fn(),
// };
