// Auth
export const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  restore: jest.fn(),
  socialLogin: jest.fn(),
  getJwtTokens: jest.fn(),
};

// User
export const mockUserService = {
  findOneByOptions: jest.fn(),
  getProfile: jest.fn(),
  create: jest.fn(),
  checkNick: jest.fn(),
  update: jest.fn(),
  upload: jest.fn(),
  delete: jest.fn(),
};

// Category
export const mockCategoryService = {
  findAll: jest.fn(),
  findOneWithSub: jest.fn(),
  createParent: jest.fn(),
  createSub: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  validateCategory: jest.fn(),
};

// Category_Course
export const mockCategoryCourseService = {
  linkCourseToCategories: jest.fn(),
  updateCourseToCategories: jest.fn(),
};

// Course
export const mockCourseService = {
  findOneByOptions: jest.fn(),
  findCourseDetail: jest.fn(),
  getStatusByUser: jest.fn(),
  getDashBoard: jest.fn(),
  findAllCourse: jest.fn(),
  create: jest.fn(),
  addOrCancelWish: jest.fn(),
  update: jest.fn(),
  uploadImage: jest.fn(),
  delete: jest.fn(),
  getCourseIdsByInstructor: jest.fn(),
  validateInstructor: jest.fn(),
  updateTotalLessonCountInCourse: jest.fn(),
  updateCourseStudents: jest.fn(),
  courseReviewRatingUpdate: jest.fn(),
};

// Course_User
export const mockCourseUserService = {
  checkBoughtCourseByUser: jest.fn(),
  validateBoughtCourseByUser: jest.fn(),
  saveCourseUserRepo: jest.fn(),
  findMyCourses: jest.fn(),
  findOneByOptions: jest.fn(),
  saveFreeCourseUserRepo: jest.fn(),
  cancelFreeCourseUserRepo: jest.fn(),
};

// Course_Wish
export const mockCourseWishService = {
  toggleCourseWishStatus: jest.fn(),
  findOneByOptions: jest.fn(),
  findWishCoursesByUser: jest.fn(),
};

// Section
export const mockSectionService = {
  findOneByOptions: jest.fn(),
  updateLessonCountInSection: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Lesson
export const mockLessonService = {
  viewLesson: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findOneByOptions: jest.fn(),
  getCourseIdByLessonIdWithQueryBuilder: jest.fn(),
};

// Video
export const mockVideoService = {
  upload: jest.fn(),
  delete: jest.fn(),
};

// Cart
export const mockCartService = {
  findMyCart: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  clearCartWithTransaction: jest.fn(),
  removeCart: jest.fn(),
};

// Cart_Course
export const mockCartCourseService = {
  insertCourseInCart: jest.fn(),
  deleteCourseInCart: jest.fn(),
};

// Order
export const mockOrderService = {
  findOrders: jest.fn(),
  findOrderDetail: jest.fn(),
  create: jest.fn(),
};

// Order_Course
export const mockOrderCourseService = {
  saveOrderCourseRepoWithTransaction: jest.fn(),
};

// Voucher
export const mockVoucherService = {
  create: jest.fn(),
  delete: jest.fn(),
};

// Question
export const mockQuestionService = {
  calculateQuestionCountByCourseId: jest.fn().mockResolvedValue(10),
  findQuestionsByInstructorCourse: jest.fn(),
  findOneByOptions: jest.fn(),
  findAll: jest.fn(),
  findAllByCourse: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateVoteStatus: jest.fn(),
  update: jest.fn(),
  status: jest.fn(),
  delete: jest.fn(),
  findMyQuestions: jest.fn(),
};

// Question-Comment
export const mockQuestionCommentService = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Question-ReComment
export const mockQuestionReCommentService = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Question-Vote
export const mockQuestionVoteService = {
  handleVoteUpdate: jest.fn(),
};

// Review
export const mockReviewService = {
  findReviewsByInstructorCourse: jest.fn(),
  findOneByOptions: jest.fn(),
  findAllByCourse: jest.fn(),
  create: jest.fn(),
  addOrCancelLike: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Review-Comment
export const mockReviewCommentService = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Review-Like
export const mockReviewLikeService = {
  toggleReviewLikeStatus: jest.fn(),
  findOneByOptions: jest.fn(),
};

// Instructor
export const mockInstructorService = {
  getMyCoursesByInstructor: jest.fn(),
  getQuestionsByMyCourses: jest.fn(),
  getReviewsByMyCourses: jest.fn(),
  create: jest.fn(),
};

// Jwt
export const mockJwtService = {
  sign: jest.fn(),
  verifyAsync: jest.fn(),
};

// Redis
export const mockRedisService = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue('refresh_token'),
  del: jest.fn().mockResolvedValue(undefined),
};

// AWS-S3
export const mockAwsS3Service = {
  deleteS3Object: jest.fn(),
  uploadFileToS3: jest.fn(),
};

// Iamport
export const mockIamportService = {
  getPaymentData: jest.fn(),
};

// EventEmitter2
export const mockEventEmitter2 = {
  emit: jest.fn(),
};

// coolsms
export const mockCoolsmsService = {
  sendSMS: jest.fn(),
};
