import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from '@src/aws-s3/aws-s3.service';
import { CategoryService } from '@src/category/category.service';
import { CategoryCourseService } from '@src/category_course/category_course.service';
import { CourseService } from '@src/course/course.service';
import { CourseUserService } from '@src/course_user/course-user.service';
import { CourseWishService } from '@src/course/course-wish/course-wish.service';
import { QuestionEntity } from '@src/question/entities/question.entity';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { CourseEntity } from '@src/course/entities/course.entity';
import {
  mockCourseRepository,
  mockQuestionRepository,
  mockAwsS3Service,
  mockCategoryCourseService,
  mockCategoryService,
  mockCourseUserService,
  mockCourseWishService,
  mockCourses,
  expectedCourseList,
  mockCourseDetail,
  expectedCourseDetail,
  mockCourseDashBoard,
  expectedCourseDashboard,
  mockCreatedCourse,
  mockCreateCourseDto,
  mockUpdateCourseDto,
} from '@test/__mocks__/course.mock';
import { CourseListQueryDto } from '@src/course/dtos/course-list.query.dto';
import {
  ECourseChargeType,
  ECourseLevelType,
  ECourseSortBy,
} from '@src/course/enums/course.enum';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { mockCreatedQuestion } from '@test/__mocks__/question.mock';
import { mockCategoryCourse } from '@test/__mocks__/categoryCourse.mock';
import { mockCreatedInstructor } from '@test/__mocks__/user.mock';
import { mockCreatedCourseWish } from '@test/__mocks__/courseWish.mock';
import { EReviewMethod } from '@src/review/enums/review.enum';
import { CourseIdsReponseDto } from '@src/course/dtos/response/course.response';
import { ELessonAction } from '@src/lesson/enums/lesson.enum';
import { EOrderAction } from '@src/order/enums/order.enum';

const mockQueryRunner = {
  manager: {},
} as QueryRunner;

class MockDataSource {
  createQueryRunner(): QueryRunner {
    return mockQueryRunner;
  }
}

describe('CourseService', () => {
  let courseService: CourseService;
  let courseRepository: Repository<CourseEntity>;
  let questionRepository: Repository<QuestionEntity>;
  let categoryService: CategoryService;
  let categoryCourseService: CategoryCourseService;
  let courseWishService: CourseWishService;
  let awsS3Service: AwsS3Service;
  let dataSource: DataSource;
  let courseUserService: CourseUserService;

  const courseId = 'uuid';
  const userId = 'uuid';
  const user = mockCreatedInstructor;
  const mockEntityManager = {
    increment: jest.fn(),
    decrement: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    Object.assign(mockQueryRunner.manager, {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    });
    mockQueryRunner.connect = jest.fn();
    mockQueryRunner.startTransaction = jest.fn();
    mockQueryRunner.commitTransaction = jest.fn();
    mockQueryRunner.rollbackTransaction = jest.fn();
    mockQueryRunner.release = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(CourseEntity),
          useValue: mockCourseRepository,
        },
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: mockQuestionRepository,
        },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: CategoryCourseService, useValue: mockCategoryCourseService },
        { provide: CourseWishService, useValue: mockCourseWishService },
        { provide: AwsS3Service, useValue: mockAwsS3Service },
        { provide: DataSource, useClass: MockDataSource },
        { provide: CourseUserService, useValue: mockCourseUserService },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    courseRepository = module.get<Repository<CourseEntity>>(
      getRepositoryToken(CourseEntity),
    );
    questionRepository = module.get<Repository<QuestionEntity>>(
      getRepositoryToken(QuestionEntity),
    );
    categoryService = module.get<CategoryService>(CategoryService);
    categoryCourseService = module.get<CategoryCourseService>(
      CategoryCourseService,
    );
    courseWishService = module.get<CourseWishService>(CourseWishService);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    dataSource = module.get<DataSource>(DataSource);
    courseUserService = module.get<CourseUserService>(CourseUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(courseService).toBeDefined();
    expect(courseRepository).toBeDefined();
    expect(questionRepository).toBeDefined();
    expect(categoryService).toBeDefined();
    expect(categoryCourseService).toBeDefined();
    expect(courseWishService).toBeDefined();
    expect(awsS3Service).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(courseUserService).toBeDefined();
  });

  describe('[강의 전체 조회]', () => {
    let query: CourseListQueryDto;

    beforeEach(() => {
      query = new CourseListQueryDto();
    });

    it('파라미터에 카테고리없이 전체 조회 성공', async () => {
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockCourses);

      const result = await courseService.findAllCourse(query);

      expect(result).toEqual(expectedCourseList);
      expect(
        courseRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledTimes(1);
      expect(
        courseRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('메인카테고리 넣어서 조회시 호출 확인', async () => {
      const mainCategoryId = 'uuid';

      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockCourses);

      const result = await courseService.findAllCourse(query, mainCategoryId);

      expect(result).toEqual(expectedCourseList);
      expect(courseRepository.createQueryBuilder().innerJoin).toBeCalledTimes(
        1,
      );
      expect(courseRepository.createQueryBuilder().innerJoin).toBeCalledWith(
        'course.categoriesCourses',
        'categoryCourse',
      );
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'categoryCourse.fk_parent_category_id = :mainCategoryId',
        {
          mainCategoryId,
        },
      );
    });

    it('메인카테고리+서브카테고리 넣어서 조회시 호출 확인', async () => {
      const mainCategoryId = 'uuid';
      const subCategoryId = 'uuid';

      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockCourses);

      const result = await courseService.findAllCourse(
        query,
        mainCategoryId,
        subCategoryId,
      );

      expect(result).toEqual(expectedCourseList);
      expect(courseRepository.createQueryBuilder().innerJoin).toBeCalledTimes(
        1,
      );
      expect(courseRepository.createQueryBuilder().innerJoin).toBeCalledWith(
        'course.categoriesCourses',
        'categoryCourse',
      );
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledTimes(2);
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'categoryCourse.fk_parent_category_id = :mainCategoryId',
        {
          mainCategoryId,
        },
      );
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'categoryCourse.fk_sub_category_id = :subCategoryId',
        {
          subCategoryId,
        },
      );
    });

    it('검색필터 호출 확인 - 강의레벨', async () => {
      const level = ECourseLevelType.Beginner;
      query.level = level;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'course.level = :level',
        { level },
      );
    });

    it('검색필터 호출 확인 - 검색어', async () => {
      const s = '검색어';
      query.s = s;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'LOWER(course.title) LIKE LOWER(:title)',
        {
          title: `%${s.toLowerCase()}%`,
        },
      );
    });

    it('검색필터 호출 확인 - 가격별(무료)', async () => {
      query.charge = ECourseChargeType.Free;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'course.price = :price',
        { price: 0 },
      );
    });

    it('검색필터 호출 확인 - 가격별(유료)', async () => {
      query.charge = ECourseChargeType.Paid;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().andWhere).toBeCalled();
      expect(courseRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'course.price <> :price',
        { price: 0 },
      );
    });

    it('정렬필터 호출 확인 - 찜한순', async () => {
      query.sort = ECourseSortBy.Wish;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.wishCount',
        'DESC',
      );
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'course.created_at',
        'DESC',
      );
    });

    it('정렬필터 호출 확인 - 높은평점순', async () => {
      query.sort = ECourseSortBy.Rating;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.averageRating',
        'DESC',
      );
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'course.created_at',
        'DESC',
      );
    });

    it('정렬필터 호출 확인 - 구매순', async () => {
      query.sort = ECourseSortBy.Popular;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.students',
        'DESC',
      );
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalledWith(
        'course.created_at',
        'DESC',
      );
    });

    it('정렬필터 호출 확인 - 최신순', async () => {
      query.sort = ECourseSortBy.Recent;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.created_at',
        'DESC',
      );
    });

    it('정렬필터 호출 확인 - 오래된순', async () => {
      query.sort = ECourseSortBy.Old;

      await courseService.findAllCourse(query);

      expect(courseRepository.createQueryBuilder().orderBy).toBeCalled();
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.created_at',
        'ASC',
      );
    });
  });

  describe('[강의 상세 조회]', () => {
    it('조회 성공', async () => {
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(mockCourseDetail);

      const result = await courseService.findCourseDetail(courseId);

      expect(result).toEqual(expectedCourseDetail);
      expect(
        courseRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(7);
      expect(courseRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalledTimes(
        1,
      );
      expect(courseRepository.createQueryBuilder().getOne).toBeCalledTimes(1);
    });

    it('조회 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(null);

      try {
        await courseService.findCourseDetail(courseId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[유저가 강의를 구매했는지 여부]', () => {
    it('로그인한 유저가 강의를 구매했다면 true', async () => {
      jest
        .spyOn(courseUserService, 'checkBoughtCourseByUser')
        .mockResolvedValue(true);

      const result = await courseService.getStatusByUser(courseId, userId);

      expect(result).toEqual({ isPurchased: true });
    });

    it('로그인한 유저가 강의를 구매안했다면 false', async () => {
      jest
        .spyOn(courseUserService, 'checkBoughtCourseByUser')
        .mockResolvedValue(false);

      const result = await courseService.getStatusByUser(courseId, userId);

      expect(result).toEqual({ isPurchased: false });
    });

    it('로그인안한 유저의 경우 무조건 false', async () => {
      const result = await courseService.getStatusByUser(courseId, null);

      expect(result).toEqual({ isPurchased: false });
    });
  });

  describe('[강의 대시보드(강의 구매한 유저)]', () => {
    it('조회 성공', async () => {
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(mockCourseDashBoard);
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue([mockCreatedQuestion]);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockResolvedValue(undefined);

      const result = await courseService.getDashBoard(courseId, userId);

      expect(result).toEqual(expectedCourseDashboard);
      expect(
        courseRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(3);
      expect(courseRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().orderBy).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().addOrderBy).toBeCalledTimes(
        1,
      );
      expect(courseRepository.createQueryBuilder().getOne).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(questionRepository.createQueryBuilder().limit).toBeCalledTimes(1);
      expect(questionRepository.createQueryBuilder().getMany).toBeCalledTimes(
        1,
      );
    });

    it('조회 실패 - 강의가 없는 경우(404에러)', async () => {
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(null);

      try {
        await courseService.getDashBoard(courseId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('조회 실패 - 강의를 구매하지않은 경우(403에러)', async () => {
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(mockCourseDashBoard);
      jest
        .spyOn(questionRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue([mockCreatedQuestion]);
      jest
        .spyOn(courseUserService, 'validateBoughtCourseByUser')
        .mockRejectedValue(new ForbiddenException());

      try {
        await courseService.getDashBoard(courseId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[강의 생성]', () => {
    let queryRunner: QueryRunner;

    beforeEach(() => {
      queryRunner = dataSource.createQueryRunner();
    });

    it('생성 성공', async () => {
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(categoryService, 'validateCategoryOptionalTransaction')
        .mockResolvedValue(undefined);
      jest
        .spyOn(queryRunner.manager, 'save')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(categoryCourseService, 'linkCourseToCategories')
        .mockResolvedValue(mockCategoryCourse);

      const result = await courseService.create(mockCreateCourseDto, user);

      expect(result).toEqual(mockCreatedCourse);
      expect(queryRunner.startTransaction).toBeCalledTimes(1);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
      expect(queryRunner.manager.findOne).toBeCalledTimes(1);
      expect(queryRunner.manager.save).toBeCalledTimes(1);
      expect(categoryService.validateCategoryOptionalTransaction).toBeCalled();
      expect(categoryCourseService.linkCourseToCategories).toBeCalled();
    });

    it('생성 실패 - 같은 제목의 강의가 이미 있는 경우(400에러)', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockCreatedCourse);

      try {
        await courseService.create(mockCreateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(queryRunner.startTransaction).toBeCalledTimes(1);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('생성 실패 - 카테고리 검증 실패(없는 카테고리 - 404에러)', async () => {
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(categoryService, 'validateCategoryOptionalTransaction')
        .mockRejectedValue(new NotFoundException());

      try {
        await courseService.create(mockCreateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(queryRunner.startTransaction).toBeCalledTimes(1);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('생성 실패 - 카테고리 검증 실패(메인카테고리에 서브카테고리가 있거나 그 반대의 경우 - 400에러)', async () => {
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(categoryService, 'validateCategoryOptionalTransaction')
        .mockRejectedValue(new BadRequestException());

      try {
        await courseService.create(mockCreateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(queryRunner.startTransaction).toBeCalledTimes(1);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });
  });

  describe('[강의 수정]', () => {
    it('수정 성공(카테고리 수정 제외)', async () => {
      const updateResult = { message: '수정 성공' };

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedCourse);
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValueOnce(null);
      jest.spyOn(courseRepository, 'save').mockResolvedValue(mockCreatedCourse);

      const result = await courseService.update(
        courseId,
        mockUpdateCourseDto,
        user,
      );

      expect(result).toEqual(updateResult);
    });

    it('수정 성공(카테고리 수정 포함)', async () => {
      const updateResult = { message: '수정 성공' };
      const mockUpdateCourseDtoWithCategory = {
        ...mockCreateCourseDto,
        selectedCategoryIds: [
          {
            parentCategoryId: 'uuid',
            subCategoryId: 'uuid',
          },
        ],
      };

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedCourse);
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValueOnce(null);
      jest
        .spyOn(categoryService, 'validateCategoryOptionalTransaction')
        .mockResolvedValue(undefined);
      jest
        .spyOn(categoryCourseService, 'updateCourseToCategories')
        .mockResolvedValue(undefined);
      jest.spyOn(courseRepository, 'save').mockResolvedValue(mockCreatedCourse);

      const result = await courseService.update(
        courseId,
        mockUpdateCourseDtoWithCategory,
        user,
      );

      expect(result).toEqual(updateResult);
      expect(
        categoryService.validateCategoryOptionalTransaction,
      ).toBeCalledTimes(1);
      expect(categoryCourseService.updateCourseToCategories).toBeCalledTimes(1);
    });

    it('수정 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await courseService.update(courseId, mockUpdateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('수정 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockRejectedValue(new ForbiddenException());

      try {
        await courseService.update(courseId, mockUpdateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('수정 실패 - 같은 제목의 강의인 경우(400에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedCourse);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockRejectedValue(new BadRequestException());

      try {
        await courseService.update(courseId, mockUpdateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('수정 실패 - 카테고리 수정하는데 없는 카테고리인 경우(404에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedCourse);
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValueOnce(null);
      jest
        .spyOn(categoryService, 'validateCategoryOptionalTransaction')
        .mockRejectedValue(new NotFoundException());

      try {
        await courseService.update(courseId, mockUpdateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('수정 실패 - 카테고리 수정하는데 메인,서브 반대로 넣은 경우(400에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValueOnce(mockCreatedCourse);
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValueOnce(null);
      jest
        .spyOn(categoryService, 'validateCategoryOptionalTransaction')
        .mockRejectedValue(undefined);
      jest
        .spyOn(categoryCourseService, 'updateCourseToCategories')
        .mockRejectedValue(new BadRequestException());

      try {
        await courseService.update(courseId, mockUpdateCourseDto, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('[강의 커버이미지 업로드]', () => {
    let queryRunner: QueryRunner;
    const file = {
      fieldname: 'avatar',
      originalname: 'pikachu.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('pikachu.jpg'),
      size: 32805,
    } as Express.Multer.File;
    const uploadUrl =
      'https://hoonflearn-s3.s3.amazonaws.com/유저-5de97050-6554-477b-a80d-52a7bbb6c273/강의-3fa58443-8437-4b32-a827-76a3eff2bfc5/coverImage/1694766947527_pikachu.jpg';
    const mockCreatedCourseWithImage = {
      ...mockCreatedCourse,
      coverImage: uploadUrl,
    };

    beforeEach(() => {
      queryRunner = dataSource.createQueryRunner();
    });

    it('업로드 성공 - 처음 업로드', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockCreatedCourse);
      jest.spyOn(awsS3Service, 'uploadFileToS3').mockResolvedValue(uploadUrl);
      jest
        .spyOn(queryRunner.manager, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      const result = await courseService.uploadImage(courseId, user, file);

      expect(result).toBe(uploadUrl);
      expect(queryRunner.startTransaction).toBeCalledTimes(1);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
      expect(queryRunner.manager.findOne).toBeCalledTimes(1);
      expect(queryRunner.manager.update).toBeCalledTimes(1);
      expect(awsS3Service.uploadFileToS3).toBeCalledTimes(1);
    });

    it('업로드 성공 - 이미 업로드 했던 경우 기존꺼 삭제', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(mockCreatedCourseWithImage);
      jest
        .spyOn(awsS3Service, 'deleteS3Object')
        .mockResolvedValue({ success: true });
      jest.spyOn(awsS3Service, 'uploadFileToS3').mockResolvedValue(uploadUrl);
      jest
        .spyOn(queryRunner.manager, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      const result = await courseService.uploadImage(courseId, user, file);

      expect(result).toBe(uploadUrl);
      expect(queryRunner.startTransaction).toBeCalledTimes(1);
      expect(queryRunner.commitTransaction).toBeCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toBeCalledTimes(0);
      expect(queryRunner.release).toBeCalledTimes(1);
      expect(queryRunner.manager.findOne).toBeCalledTimes(1);
      expect(queryRunner.manager.update).toBeCalledTimes(1);
      expect(awsS3Service.uploadFileToS3).toBeCalledTimes(1);
      expect(awsS3Service.deleteS3Object).toBeCalledTimes(1);
    });

    it('업로드 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);

      try {
        await courseService.uploadImage(courseId, user, file);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });

    it('업로드 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockRejectedValue(new ForbiddenException());

      try {
        await courseService.uploadImage(courseId, user, file);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(queryRunner.commitTransaction).toBeCalledTimes(0);
        expect(queryRunner.rollbackTransaction).toBeCalledTimes(1);
        expect(queryRunner.release).toBeCalledTimes(1);
      }
    });
  });

  describe('[강의 찜하기 및 취소]', () => {
    it('찜하기 성공', async () => {
      jest.spyOn(courseService, 'isWishByUser').mockResolvedValue(false);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(courseWishService, 'toggleCourseWishStatus')
        .mockResolvedValue(undefined);

      const result = await courseService.addOrCancelWish(courseId, userId);

      expect(result).toBeUndefined();
      expect(courseWishService.toggleCourseWishStatus).toBeCalledWith(
        courseId,
        userId,
        false,
      );
    });

    it('찜하기 취소 성공', async () => {
      jest.spyOn(courseService, 'isWishByUser').mockResolvedValue(true);
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(courseWishService, 'toggleCourseWishStatus')
        .mockResolvedValue(undefined);

      const result = await courseService.addOrCancelWish(courseId, userId);

      expect(result).toBeUndefined();
      expect(courseWishService.toggleCourseWishStatus).toBeCalledWith(
        courseId,
        userId,
        true,
      );
    });

    it('찜하기 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await courseService.addOrCancelWish(courseId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[isWishByUser 테스트 - 유저가 찜했는지 안했는지 boolean값 반환]', () => {
    it('찜했던 경우 true 반환', async () => {
      jest
        .spyOn(courseWishService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourseWish);

      const result = await courseService.isWishByUser(courseId, userId);

      expect(result).toBe(true);
    });

    it('찜안했던 경우 false 반환', async () => {
      jest.spyOn(courseWishService, 'findOneByOptions').mockResolvedValue(null);

      const result = await courseService.isWishByUser(courseId, userId);

      expect(result).toBe(false);
    });
  });

  describe('[강의 삭제]', () => {
    const uploadUrl =
      'https://hoonflearn-s3.s3.amazonaws.com/유저-5de97050-6554-477b-a80d-52a7bbb6c273/강의-3fa58443-8437-4b32-a827-76a3eff2bfc5/coverImage/1694766947527_pikachu.jpg';
    const mockCreatedCourseWithImage = {
      ...mockCreatedCourse,
      coverImage: uploadUrl,
    };
    const mockVideo = [{ video_videoUrl: uploadUrl }];

    it('삭제 성공', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourseWithImage);
      jest
        .spyOn(awsS3Service, 'deleteS3Object')
        .mockResolvedValue({ success: true });
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getRawMany')
        .mockResolvedValue(mockVideo);
      jest
        .spyOn(awsS3Service, 'deleteS3Object')
        .mockResolvedValue({ success: true });
      jest
        .spyOn(courseRepository, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await courseService.delete(courseId, user);

      expect(result).toBe(true);
      expect(
        courseRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(3);
      expect(courseRepository.createQueryBuilder().where).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().select).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().getRawMany).toBeCalledTimes(
        1,
      );
    });

    it('삭제 실패 - 해당 강의가 없는 경우(404에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await courseService.delete(courseId, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('삭제 실패 - 해당 강의를 만든 지식공유자가 아닌 경우(403에러)', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockRejectedValue(new ForbiddenException());

      try {
        await courseService.delete(courseId, user);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[validateInstructor 테스트 - 해당 강의를 만든 지식공유자인지 검증하는 로직]', () => {
    it('맞는 경우 아무것도 반환X', async () => {
      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);

      const result = await courseService.validateInstructor(courseId, userId);

      expect(result).toBeUndefined();
    });

    it('아닌 경우 오류(403에러)', async () => {
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await courseService.validateInstructor(courseId, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('[courseReviewRatingUpdate 테스트 - method에 따라 리뷰 수,점수 업데이트]', () => {
    // 트랜잭션은 생략

    const course = mockCreatedCourse;
    const rating = 5;

    it('리뷰생성의 경우', async () => {
      const method = EReviewMethod.Create;
      const updateValue = {
        reviewCount: course.reviewCount + 1,
        averageRating: rating,
      };

      jest
        .spyOn(courseRepository, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      await courseService.courseReviewRatingUpdate(course, rating, method);

      expect(courseRepository.update).toBeCalledWith(
        { id: course.id },
        updateValue,
      );
    });

    it('리뷰수정의 경우', async () => {
      const method = EReviewMethod.Update;
      const updateValue = {
        averageRating: rating,
      };

      jest
        .spyOn(courseRepository, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      await courseService.courseReviewRatingUpdate(course, rating, method);

      expect(courseRepository.update).toBeCalledWith(
        { id: course.id },
        updateValue,
      );
    });

    it('리뷰삭제의 경우', async () => {
      const method = EReviewMethod.Delete;
      const updateValue = {
        reviewCount: course.reviewCount - 1,
        averageRating: rating,
      };

      jest
        .spyOn(courseRepository, 'update')
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      await courseService.courseReviewRatingUpdate(course, rating, method);

      expect(courseRepository.update).toBeCalledWith(
        { id: course.id },
        updateValue,
      );
    });
  });

  describe('[getCourseIdsByInstructor 테스트 - 지식공유자가 만든 강의ID만 가져오는 로직]', () => {
    it('성공', async () => {
      jest
        .spyOn(courseRepository, 'find')
        .mockResolvedValue([mockCreatedCourse]);

      const result = await courseService.getCourseIdsByInstructor(userId);

      expect(result).toEqual(CourseIdsReponseDto.from([mockCreatedCourse]));
    });
  });

  describe('[updateTotalLessonCountInCourse 테스트 - 수업 생성 또는 삭제에 따라 업데이트]', () => {
    const updateResult = { generatedMaps: [], raw: [], affected: 1 };

    it('수업 생성 - 강의엔티티에 수업 수 증가', async () => {
      const action = ELessonAction.Create;

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(mockEntityManager, 'increment')
        .mockResolvedValue(updateResult);

      await courseService.updateTotalLessonCountInCourse(
        courseId,
        action,
        mockEntityManager,
      );

      expect(mockEntityManager.increment).toBeCalledWith(
        CourseEntity,
        { id: courseId },
        'totalLessonCount',
        1,
      );
    });

    it('수업 삭제 - 강의엔티티에 수업 수 감소', async () => {
      const action = ELessonAction.Delete;

      jest
        .spyOn(courseService, 'findOneByOptions')
        .mockResolvedValue(mockCreatedCourse);
      jest
        .spyOn(mockEntityManager, 'decrement')
        .mockResolvedValue(updateResult);

      await courseService.updateTotalLessonCountInCourse(
        courseId,
        action,
        mockEntityManager,
      );

      expect(mockEntityManager.decrement).toBeCalledWith(
        CourseEntity,
        { id: courseId },
        'totalLessonCount',
        1,
      );
    });

    it('실패 - 해당 강의가 없는 경우(404에러)', async () => {
      const action = ELessonAction.Create;
      jest.spyOn(courseService, 'findOneByOptions').mockResolvedValue(null);

      try {
        await courseService.updateTotalLessonCountInCourse(
          courseId,
          action,
          mockEntityManager,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('[calculateCoursePriceInCart 테스트 - 강의들의 총 가격 반환]', () => {
    it('성공', async () => {
      const courseIds = ['uuid'];
      jest
        .spyOn(courseRepository.createQueryBuilder(), 'getRawOne')
        .mockResolvedValue({ total: '10000' });

      const result = await courseService.calculateCoursePriceInCart(courseIds);

      expect(result).toBe(10000);
      expect(courseRepository.createQueryBuilder().whereInIds).toBeCalledTimes(
        1,
      );
      expect(courseRepository.createQueryBuilder().select).toBeCalledTimes(1);
      expect(courseRepository.createQueryBuilder().getRawOne).toBeCalledTimes(
        1,
      );
    });
  });

  describe('[updateCourseStudents 테스트 - 주문 또는 환불에 따라 학생수 업데이트]', () => {
    const updateResult = { generatedMaps: [], raw: [], affected: 1 };
    const courseIds = ['uuid'];

    it('주문 - 강의엔티티에 학생 수 증가', async () => {
      const action = EOrderAction.Create;
      jest
        .spyOn(mockEntityManager, 'increment')
        .mockResolvedValue(updateResult);

      await courseService.updateCourseStudents(
        courseIds,
        action,
        mockEntityManager,
      );

      expect(mockEntityManager.increment).toBeCalledWith(
        CourseEntity,
        { id: courseIds[0] },
        'students',
        1,
      );
    });

    it('환불 - 강의엔티티에 학생 수 감소', async () => {
      const action = EOrderAction.Delete;
      jest
        .spyOn(mockEntityManager, 'decrement')
        .mockResolvedValue(updateResult);

      await courseService.updateCourseStudents(
        courseIds,
        action,
        mockEntityManager,
      );

      expect(mockEntityManager.decrement).toBeCalledWith(
        CourseEntity,
        { id: courseIds[0] },
        'students',
        1,
      );
    });
  });
});
