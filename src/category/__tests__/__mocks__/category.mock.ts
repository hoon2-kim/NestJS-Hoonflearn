import { CategoryEntity } from '@src/category/entities/category.entity';

export const mockCreatedMainCategory = {
  id: 'uuid',
  name: '메인',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_parent_category_id: null,
} as CategoryEntity;

export const mockCreatedSubCategory = {
  id: 'uuid',
  name: '서브',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_parent_category_id: 'parent-uuid',
} as CategoryEntity;

export const mockCategory: CategoryEntity = {
  id: 'uuid1',
  name: '메인',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_parent_category_id: null,
  children: [
    {
      id: 'uuid2',
      name: '서브1',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      fk_parent_category_id: 'uuid1',
      children: [],
    },
    {
      id: 'uuid3',
      name: '서브2',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      fk_parent_category_id: 'uuid1',
      children: [],
    },
  ],
};

export const mockCategoryRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(), // this는 createQueryBuilder를 가리킨다.
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
