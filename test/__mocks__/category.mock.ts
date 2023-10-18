import { CategoryEntity } from '@src/category/entities/category.entity';

export const mockCreatedMainCategory = {
  id: 'uuid',
  name: '메인',
  created_at: new Date('2023-10'),
  updated_at: new Date('2023-10'),
  fk_parent_category_id: null,
} as CategoryEntity;

// export const mockCreatedSubCategory = {
//   id: 'uuid',
//   name: '서브',
//   created_at: new Date('2023-10'),
//   updated_at: new Date('2023-10'),
//   fk_parent_category_id: 'parent-uuid',
// } as CategoryEntity;

// export const mockCategory: CategoryEntity = {
//   id: 'uuid1',
//   name: '메인',
//   created_at: new Date('2023-10'),
//   updated_at: new Date('2023-10'),
//   fk_parent_category_id: null,
//   children: [
//     {
//       id: 'uuid2',
//       name: '서브1',
//       created_at: new Date('2023-10'),
//       updated_at: new Date('2023-10'),
//       fk_parent_category_id: 'uuid1',
//       children: [],
//     },
//     {
//       id: 'uuid3',
//       name: '서브2',
//       created_at: new Date('2023-10'),
//       updated_at: new Date('2023-10'),
//       fk_parent_category_id: 'uuid1',
//       children: [],
//     },
//   ],
// };

export const mockCategory = (): CategoryEntity => {
  const categoryEntity = new CategoryEntity();
  categoryEntity.id = 'uuid';
  categoryEntity.name = '이름';
  categoryEntity.fk_parent_category_id = null;
  categoryEntity.created_at = new Date('2023-10');
  categoryEntity.updated_at = new Date('2023-10');

  return categoryEntity;
};

export const mockCategoryWithSub = (): CategoryEntity => {
  const categoryEntity = new CategoryEntity();
  categoryEntity.id = 'uuid';
  categoryEntity.name = '이름';
  categoryEntity.fk_parent_category_id = null;
  categoryEntity.created_at = new Date('2023-10');
  categoryEntity.updated_at = new Date('2023-10');
  categoryEntity.children = [
    {
      id: 'uuid2',
      name: '이름2',
      fk_parent_category_id: 'uuid',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      children: [],
    },
    {
      id: 'uuid3',
      name: '이름3',
      fk_parent_category_id: 'uuid',
      created_at: new Date('2023-10'),
      updated_at: new Date('2023-10'),
      children: [],
    },
  ];

  return categoryEntity;
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
