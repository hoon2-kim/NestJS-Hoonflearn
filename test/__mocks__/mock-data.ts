import { GoogleTokenDto } from '@src/auth/dtos/google-token.dto';
import { LoginUserDto } from '@src/auth/dtos/login-user.dto';
import { IAuthToken, IJwtPayload } from '@src/auth/interfaces/auth.interface';
import { CreateCartDto } from '@src/cart/dtos/create-cart.dto';
import { CartEntity } from '@src/cart/entities/cart.entity';
import { CartCourseEntity } from '@src/cart_course/entities/cart-course.entity';
import { CreateCategoryDto } from '@src/category/dtos/create-category.dto';
import { UpdateCategoryDto } from '@src/category/dtos/update-category.dto';
import { CategoryEntity } from '@src/category/entities/category.entity';
import { CategoryCourseEntity } from '@src/category_course/entities/category-course.entitiy';
import { CreateCouponDto } from '@src/coupon/dtos/create-coupon.dto';
import { RegisterCouponDto } from '@src/coupon/dtos/register-coupon.dto';
import { UpdateCouponDto } from '@src/coupon/dtos/update-coupon.dto';
import { CouponEntity, ECouponType } from '@src/coupon/entities/coupon.entity';
import { CouponUserEntity } from '@src/coupon_user/entities/coupon-user.entity';
import { CourseWishEntity } from '@src/course/course-wish/entities/course-wish.entity';
import { CreateCourseDto } from '@src/course/dtos/create-course.dto';
import { UpdateCourseDto } from '@src/course/dtos/update-course.dto';
import { CourseEntity } from '@src/course/entities/course.entity';
import { ECourseLevelType } from '@src/course/enums/course.enum';
import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';
import { ECouresUserType } from '@src/course_user/enums/course-user.enum';
import { CreateInstructorDto } from '@src/instructor/dtos/create-instructor.dto';
import { InstructorProfileEntity } from '@src/instructor/entities/instructor-profile.entity';
import { EFieldOfHopeType } from '@src/instructor/enums/instructor.enum';
import { CreateLessonDto } from '@src/lesson/dtos/create-lesson.dto';
import { UpdateLessonDto } from '@src/lesson/dtos/update-lesson.dto';
import { LessonEntity } from '@src/lesson/entities/lesson.entity';
import { CreateOrderDto } from '@src/order/dtos/create-order.dto';
import { OrderEntity } from '@src/order/entities/order.entity';
import { EOrderStatus } from '@src/order/enums/order.enum';
import { OrderCourseEntity } from '@src/order_course/entities/order-course.entity';
import { CreateQuestionDto } from '@src/question/dtos/create-question.dto';
import { UpdateQuestionDto } from '@src/question/dtos/update-question.dto';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { EQuestionStatus } from '@src/question/enums/question.enum';
import { CreateQuestionCommentDto } from '@src/question/question-comment/dtos/create-question-comment.dto';
import { UpdateQuestionCommentDto } from '@src/question/question-comment/dtos/update-question-comment.dto';
import { QuestionCommentEntity } from '@src/question/question-comment/entities/question-comment.entity';
import { CreateQuestionReCommentDto } from '@src/question/question-comment/question-reComment/dtos/request/create-question-recomment.dto';
import { UpdateQuestionReCommentDto } from '@src/question/question-comment/question-reComment/dtos/request/update-question-recomment.dto';
import { QuestionVoteEntity } from '@src/question/question-vote/entities/question-vote.entity';
import { EQuestionVoteType } from '@src/question/question-vote/enums/question-vote.enum';
import { CreateReviewDto } from '@src/review/dtos/create-review.dto';
import { UpdateReviewDto } from '@src/review/dtos/update-review.dto';
import { ReviewEntity } from '@src/review/entities/review.entity';
import { CreateReviewCommentDto } from '@src/review/review-comment/dtos/create-review-comment.dto';
import { UpdateReviewCommentDto } from '@src/review/review-comment/dtos/update-review-comment.dto';
import { ReviewCommentEntity } from '@src/review/review-comment/entities/review-comment.entity';
import { ReviewLikeEntity } from '@src/review/review-like/entities/review-like.entity';
import { CreateSectionDto } from '@src/section/dtos/create-section.dto';
import { UpdateSectionDto } from '@src/section/dtos/update-section.dto';
import { SectionEntity } from '@src/section/entities/section.entity';
import {
  CreateUserDto,
  NicknameDto,
  PhoneCheckDto,
  PhoneDto,
} from '@src/user/dtos/create-user.dto';
import { UpdateUserDto } from '@src/user/dtos/update-user.dto';
import { UserEntity } from '@src/user/entities/user.entity';
import { ERoleType } from '@src/user/enums/user.enum';
import { VideoEntity } from '@src/video/entities/video.entity';
import { CreateVoucherDto } from '@src/voucher/dtos/create-voucher.dto';

// Auth
export const mockLoginUserDto: LoginUserDto = {
  email: 'test@test.com',
  password: 'test',
};

export const mockJwtTokens: IAuthToken = {
  access_token: 'access',
  refresh_token: 'refresh',
};

export const mockJwtPayload: IJwtPayload = {
  id: 'uuid',
  email: 'test@test.com',
  role: ERoleType.User,
};

export const mockGoogleTokenDto: GoogleTokenDto = { token: 'id_token' };

// Cart
export const mockCart = {
  id: 'uuid',
  fk_user_id: 'uuid',
  created_at: new Date(),
  updated_at: new Date(),
} as CartEntity;

export const mockCreateCartDto: CreateCartDto = {
  courseId: 'uuid',
};

// CartCourse
export const mockCartCourse = {
  id: 'uuid',
  fk_course_id: 'uuid',
  fk_cart_id: 'uuid',
  created_at: new Date(),
} as CartCourseEntity;

// Category
export const mockCreateCategoryDto: CreateCategoryDto = {
  name: '카테고리',
};

export const mockUpdateCategoryDto: UpdateCategoryDto = {
  name: '수정',
};

export const mockMainCategory = {
  id: 'uuid',
  name: '카테고리',
  created_at: new Date(),
  updated_at: new Date(),
  fk_parent_category_id: null,
} as CategoryEntity;

export const mockSubCategory = {
  id: 'uuid2',
  name: '서브 카테고리',
  created_at: new Date(),
  updated_at: new Date(),
  fk_parent_category_id: mockMainCategory.id,
} as CategoryEntity;

// CategoryCourse
export const mockCategoryCourse = {
  id: 'uuid',
  fk_parent_category_id: 'uuid',
  fk_sub_category_id: 'uuid',
  fk_course_id: 'uuid',
  isMain: true,
} as CategoryCourseEntity;

// Course
export const mockCreateCourseDto: CreateCourseDto = {
  title: '강의제목',
  learnable: ['배움1', '배움2'],
  recommendedFor: ['추천1', '추천2'],
  prerequisite: ['선수지식'],
  level: ECourseLevelType.Beginner,
  summary: '두줄요약',
  description: '설명',
  price: 10000,
  selectedCategoryIds: [
    {
      parentCategoryId: 'uuid',
      subCategoryId: 'uuid',
    },
  ],
};

export const mockUpdateCourseDto: UpdateCourseDto = {
  title: '수정',
  //   learnable: ['배움1', '배움2'],
  //   recommendedFor: ['추천1', '추천2'],
  //   prerequisite: ['선수지식'],
  //   level: ECourseLevelType.Introduction,
  //   summary: '수정',
  //   description: '수정',
};

export const mockPaidCourse = {
  id: 'uuid',
  title: '강의',
  learnable: ['배움1', '배움2'],
  recommendedFor: ['추천1', '추천2'],
  prerequisite: ['선수지식'],
  level: ECourseLevelType.Beginner,
  summary: '두줄요약',
  description: '설명',
  price: 10000,
  coverImage: null,
  averageRating: 0.0,
  reviewCount: 0,
  wishCount: 0,
  totalVideosTime: 0,
  totalLessonCount: 0,
  students: 0,
  created_at: new Date(),
  updated_at: new Date(),
  fk_instructor_id: 'uuid',
} as CourseEntity;

export const mockFreeCourse = {
  ...mockPaidCourse,
  price: 0,
} as CourseEntity;

// CourseUser
export const mockCourseUserWithFree = {
  id: 'uuid',
  fk_course_id: 'uuid',
  fk_user_id: 'uuid',
  type: ECouresUserType.Free,
  created_at: new Date(),
} as CourseUserEntity;

export const mockCourseUserWithPaid = {
  ...mockCourseUserWithFree,
  type: ECouresUserType.Paid,
} as CourseUserEntity;

// CourseWish
export const mockCourseWish = {
  id: 'uuid',
  fk_user_id: 'uuid',
  fk_course_id: 'uuid',
  created_at: new Date(),
} as CourseWishEntity;

// InstructorProfile
export const mockCreateInstructorDto: CreateInstructorDto = {
  contactEmail: 'a@a.com',
  aboutMe: '',
  fieldOfHope: EFieldOfHopeType.DevProgram,
  nameOrBusiness: '',
  link: '',
};

export const mockInstructorProfile = {
  id: 'uuid',
  contactEmail: 'a@a.com',
  nameOrBusiness: '가나다',
  fieldOfHope: EFieldOfHopeType.DevProgram,
  aboutMe: '크크크',
  link: '링크',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
  fk_user_id: 'uuid',
} as InstructorProfileEntity;

// Lesson
export const mockCreateLessonDto: CreateLessonDto = {
  sectionId: 'uuid',
  title: '수업',
  isFreePublic: true,
  note: '수업노트',
};

export const mockUpdateLessonDto: UpdateLessonDto = {
  title: '수정',
  //   note: '수정',
  //   isFreePublic: false,
};

export const mockLesson = {
  id: 'uuid',
  title: '수업',
  note: '수업노트',
  isFreePublic: true,
  created_at: new Date(),
  updated_at: new Date(),
  fk_section_id: 'uuid',
} as LessonEntity;

// Order
export const mockCreateOrderDto: CreateOrderDto = {
  courseIds: ['uuid1', 'uuid2'],
  imp_uid: 'imp_1234',
  price: mockPaidCourse.price + mockPaidCourse.price,
};

export const mockOrder = {
  id: 'uuid',
  orderName: '주문명',
  imp_uid: 'imp1234',
  merchant_uid: 'nobody_1234',
  totalOrderPrice: 10000,
  paymentMethod: 'card',
  fk_user_id: 'uuid',
  orderStatus: EOrderStatus.COMPLETED,
  created_at: new Date(),
} as OrderEntity;

// OrderCourse
export const mockOrderCourse = {
  id: 'uuid',
  fk_order_id: 'uuid',
  fk_course_id: 'uuid',
  orderPrice: mockPaidCourse.price,
  created_at: new Date(),
} as OrderCourseEntity;

// Question
export const mockCreateQuestionDto: CreateQuestionDto = {
  courseId: 'uuid',
  title: '질문제목',
  contents: '질문내용',
};

export const mockUpdateQuestionDto: UpdateQuestionDto = {
  title: '수정',
  // contents: '수정',
};

export const mockQuestion = {
  id: 'uuid',
  title: '질문제목',
  contents: '질문내용',
  fk_course_id: 'uuid',
  fk_user_id: 'uuid',
  questionStatus: EQuestionStatus.UnResolved,
  voteCount: 0,
  views: 0,
  commentCount: 0,
  created_at: new Date(),
  updated_at: new Date(),
} as QuestionEntity;

// QuestionComment
export const mockCreateQuestionCommentDto: CreateQuestionCommentDto = {
  contents: '댓글',
};

export const mockUpdateQuestionCommentDto: UpdateQuestionCommentDto = {
  contents: '댓글수정',
};

export const mockQuestionComment = {
  id: 'uuid',
  fk_question_id: 'uuid',
  fk_user_id: 'uuid',
  fk_question_comment_parentId: null,
  contents: '댓글',
  created_at: new Date(),
  updated_at: new Date(),
} as QuestionCommentEntity;

// QuestionReComment
export const mockCreateQuestionReCommentDto: CreateQuestionReCommentDto = {
  contents: '대댓글',
};

export const mockUpdateQuestionReCommentDto: UpdateQuestionReCommentDto = {
  contents: '수정',
};

export const mockQuestionReComment = {
  id: 'uuid',
  fk_question_id: 'uuid',
  fk_user_id: 'uuid',
  fk_question_comment_parentId: 'uuid',
  contents: '댓글',
  created_at: new Date(),
  updated_at: new Date(),
} as QuestionCommentEntity;

// QuestionVote
export const mockQuestionVote = {
  id: 'uuid',
  fk_question_id: 'uuid',
  fk_user_id: 'uuid',
  voteType: EQuestionVoteType.UPVOTE,
  created_at: new Date(),
  updated_at: new Date(),
} as QuestionVoteEntity;

// Review
export const mockCreateReviewDto: CreateReviewDto = {
  contents: '리뷰내용',
  courseId: 'uuid',
  rating: 5,
};

export const mockUpdateReviewDto: UpdateReviewDto = {
  contents: '수정',
};

export const mockReview = {
  contents: '리뷰',
  rating: 5,
  fk_course_id: 'uuid',
  fk_user_id: 'uuid',
  id: 'uuid',
  likeCount: 0,
  created_at: new Date(),
  updated_at: new Date(),
} as ReviewEntity;

// ReviewComment
export const mockCreateReviewCommentDto: CreateReviewCommentDto = {
  contents: '댓글',
};

export const mockUpdateReviewCommentDto: UpdateReviewCommentDto = {
  contents: '수정',
};

export const mockReviewComment = {
  id: 'uuid',
  contents: '리뷰댓글',
  fk_user_id: 'uuid',
  fk_review_id: 'uuid',
  created_at: new Date(),
  updated_at: new Date(),
} as ReviewCommentEntity;

// ReviewLike
export const mockReviewLike = {
  id: 'uuid',
  fk_review_id: 'uuid',
  fk_user_id: 'uuid',
  created_at: new Date(),
} as ReviewLikeEntity;

// Section
export const mockCreateSectionDto: CreateSectionDto = {
  courseId: 'uuid',
  title: '섹션',
  goal: '목표',
};

export const mockUpdateSectionDto: UpdateSectionDto = {
  title: '수정',
  // goal: '수정',
};

export const mockSection = {
  id: 'uuid',
  title: '섹션',
  goal: '섹션목표',
  totalSectionTime: 0,
  totalLessonBySectionCount: 0,
  created_at: new Date(),
  updated_at: new Date(),
  fk_course_id: 'uuid',
} as SectionEntity;

// User
export const mockUserByEmail = {
  id: 'uuid',
  email: 'test@test.com',
  nickname: 'test',
  password: '$2a$10$d6pqRMRn7lgBdbihKKcfM.kYSOtnZAUVjCLhEO9Ukh4oMXi5MN1hq',
  description: '자기소개',
  phone: null,
  profileAvatar: null,
  role: ERoleType.User,
  loginType: 'email',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
} as UserEntity;

export const mockUserByGoogle = {
  ...mockUserByEmail,
  loginType: 'google',
} as UserEntity;

export const mockInstructor = {
  ...mockUserByEmail,
  role: ERoleType.Instructor,
};

export const mockCreateUserDto: CreateUserDto = {
  email: 'user@user.com',
  nickname: '닉네임',
  password: '1234',
};

export const mockUpdateUserDto: UpdateUserDto = {
  description: '자기소개',
  // nickname: '닉네임 수정',
};

export const mockNickNameDto: NicknameDto = {
  nickname: '닉네임',
};

export const mockPhoneDto: PhoneDto = {
  phone: '01012341234',
};

export const mockPhoneCheckDto: PhoneCheckDto = {
  phone: '01012341234',
  token: 'token',
};

// Video
export const mockVideo = {
  id: 'uuid',
  videoUrl:
    'https://hoonflearn-s3.s3.amazonaws.com/유저-4bf75ad8-563b-45a9-a027-aec7837a7053/강의-41b5dde8-07fa-4646-8b33-7dd4b0b15e0e/videos/1698343897262_고양이끼리소통API(댓글,좋아요).mp4',
  videoTime: 10000,
  fk_lesson_id: 'uuid',
  created_at: new Date(),
} as VideoEntity;

// Voucher
export const mockCreateVoucherDto: CreateVoucherDto = {
  courseId: 'uuid',
};

// Coupon
export const mockCreateCouponDto: CreateCouponDto = {
  couponType: ECouponType.LIMIT,
  courseId: 'uuid',
  discountPrice: 10000,
  endAt: '2024-12-31',
  totalQuantity: 3,
};

export const mockUpdateCouponDto: UpdateCouponDto = {
  isActive: false,
};

export const mockRegisterCouponDto: RegisterCouponDto = {
  code: '0000679246',
};

export const mockCoupon = {
  id: 'uuid',
  couponType: ECouponType.LIMIT,
  discountPrice: 10000,
  endAt: new Date('2024-12-31'),
  totalQuantity: 3,
  code: '0000679246',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  course: {
    id: 'uuid',
  } as CourseEntity,
} as CouponEntity;

export const mockHashCoupon = {
  couponId: 'uuid',
  couponType: ECouponType.LIMIT,
  discountPrice: '10000',
  totalQuantity: '3',
  endAt: 'Tue December 31 2024 09:00:00 GMT+0900 (대한민국 표준시)',
  courseId: 'uuid',
};

// CouponUser
export const mockCouponUser = {
  id: 'uuid',
  fk_coupon_id: 'uuid',
  fk_user_id: 'uuid',
  isUsed: false,
  created_at: new Date(),
  used_at: null,
} as CouponUserEntity;

// Iamport
export const mockIamportData = {
  amount: 10000,
  apply_num: null,
  bank_code: null,
  bank_name: null,
  buyer_addr: null,
  buyer_email: '',
  buyer_name: '',
  buyer_postcode: null,
  buyer_tel: '',
  cancel_amount: 0,
  cancel_history: [],
  cancel_reason: null,
  cancel_receipt_urls: [],
  cancelled_at: 0,
  card_code: null,
  card_name: null,
  card_number: null,
  card_quota: 0,
  card_type: null,
  cash_receipt_issued: false,
  channel: 'pc',
  currency: 'KRW',
  custom_data: null,
  customer_uid: null,
  customer_uid_usage: null,
  emb_pg_provider: null,
  escrow: false,
  fail_reason: null,
  failed_at: 0,
  imp_uid: '',
  merchant_uid: '',
  name: '',
  paid_at: 0,
  pay_method: 'card',
  pg_id: 'tlgdacomxpay',
  pg_provider: 'uplus',
  pg_tid: null,
  receipt_url: '',
  started_at: 1696496974,
  status: 'ready',
  user_agent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  vbank_code: null,
  vbank_date: 0,
  vbank_holder: null,
  vbank_issued_at: 0,
  vbank_name: null,
  vbank_num: null,
};
