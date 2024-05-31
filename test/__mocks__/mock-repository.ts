// Category
export const mockCategoryRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

// Category_Course
export const mockCategoryCourseRepository = {
  save: jest.fn(),
};

// User
export const mockUserRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(), // this는 createQueryBuilder를 가리킨다.
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
  findOne: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  update: jest.fn(),
};

// Instructor
export const mockInstructorRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
};

// Course
export const mockCourseRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    whereInIds: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockReturnThis(),
  }),
};

// Course_User
export const mockCourseUserRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
  }),
  save: jest.fn(),
  findOne: jest.fn(),
};

// Course_Wish
export const mockCourseWishRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
  }),
};

// Section
export const mockSectionRepository = {
  save: jest.fn(),
  delete: jest.fn(),
};

// Lesson
export const mockLessonRepository = {
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    setQueryRunner: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
};

// Question
export const mockQuestionRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

// Question-Comment
export const mockQuestionCommentRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

// Question-Vote
export const mockQuestionVoteRepository = {
  findOne: jest.fn(),
};

// Review
export const mockReviewRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
  }),
  findOne: jest.fn(),
  save: jest.fn(),
};

// Review-Comment
export const mockReviewCommentRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

// Review-Like
export const mockReviewLikeRepository = {
  findOne: jest.fn(),
};

// Cart
export const mockCartRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

// Cart_Course
export const mockCartCourseRepository = {
  save: jest.fn(),
  delete: jest.fn(),
};

// Order
export const mockOrderRepository = {
  findAndCount: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
};

// Coupon
export const mockCouponRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
};

// CouponUser
export const mockCouponUserRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
};
