import { Test, TestingModule } from '@nestjs/testing';
import { CourseWishService } from '@src/course_wish/course_wish.service';
import { DataSource, Repository } from 'typeorm';
import { CourseWishEntity } from '@src/course_wish/entities/course-wish.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockCourseWishRepository,
  mockCourseWish,
  expectedCourseWishList,
  mockCreatedCourseWish,
} from '@test/__mocks__/courseWish.mock';
import { UserWishQueryDto } from '@src/user/dtos/query/user.query.dto';
import { ECourseChargeType } from '@src/course/enums/course.enum';
import { EUserWishCourseSort } from '@src/user/enums/user.enum';

const mockDataSource = {
  transaction: jest.fn(),
};

describe('CourseWishService', () => {
  let courseWishService: CourseWishService;
  let courseWishRepository: Repository<CourseWishEntity>;
  let dataSource: DataSource;

  const userId = 'uuid';
  const courseId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseWishService,
        {
          provide: getRepositoryToken(CourseWishEntity),
          useValue: mockCourseWishRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    courseWishService = module.get<CourseWishService>(CourseWishService);
    courseWishRepository = module.get<Repository<CourseWishEntity>>(
      getRepositoryToken(CourseWishEntity),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(courseWishService).toBeDefined();
    expect(courseWishRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('findWishCoursesByUser 테스트 - 유저가 찜한 강의 리스트 조회', () => {
    let query: UserWishQueryDto;

    beforeEach(() => {
      query = new UserWishQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(courseWishRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockCourseWish);

      const result = await courseWishService.findWishCoursesByUser(
        query,
        userId,
      );

      expect(result).toEqual(expectedCourseWishList);
      expect(
        courseWishRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(2);
      expect(courseWishRepository.createQueryBuilder().where).toBeCalledTimes(
        1,
      );
      expect(courseWishRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(courseWishRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(
        courseWishRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('검색 필터 호출 테스트 - 가격별(무료)', async () => {
      query.charge = ECourseChargeType.Free;

      await courseWishService.findWishCoursesByUser(query, userId);

      expect(
        courseWishRepository.createQueryBuilder().andWhere,
      ).toBeCalledTimes(1);
      expect(courseWishRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'course.price = :price',
        { price: 0 },
      );
    });

    it('검색 필터 호출 테스트 - 가격별(유료)', async () => {
      query.charge = ECourseChargeType.Paid;

      await courseWishService.findWishCoursesByUser(query, userId);

      expect(
        courseWishRepository.createQueryBuilder().andWhere,
      ).toBeCalledTimes(1);
      expect(courseWishRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'course.price <> :price',
        { price: 0 },
      );
    });

    it('정렬 필터 호출 테스트 - 최신순', async () => {
      query.sort = EUserWishCourseSort.Recent;

      await courseWishService.findWishCoursesByUser(query, userId);

      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'wish.created_at',
        'DESC',
      );
    });

    it('정렬 필터 호출 테스트 - 제목순', async () => {
      query.sort = EUserWishCourseSort.Title;

      await courseWishService.findWishCoursesByUser(query, userId);

      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.title',
        'ASC',
      );
    });

    it('정렬 필터 호출 테스트 - 평점높은', async () => {
      query.sort = EUserWishCourseSort.Rating;

      await courseWishService.findWishCoursesByUser(query, userId);

      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.averageRating',
        'DESC',
      );
      expect(
        courseWishRepository.createQueryBuilder().addOrderBy,
      ).toBeCalledTimes(1);
      expect(
        courseWishRepository.createQueryBuilder().addOrderBy,
      ).toBeCalledWith('course.created_at', 'DESC');
    });

    it('정렬 필터 호출 테스트 - 학생순', async () => {
      query.sort = EUserWishCourseSort.Student;

      await courseWishService.findWishCoursesByUser(query, userId);

      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(courseWishRepository.createQueryBuilder().orderBy).toBeCalledWith(
        'course.students',
        'DESC',
      );
    });
  });

  describe('toggleCourseWishStatus 테스트 - 찜하기 또는 취소하는 경우 엔티티 수정', () => {
    it('찜하는 경우 중간엔티티 저장 및 강의엔티티에 찜 개수 증가', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockCreatedCourseWish);
      const mockIncrement = jest
        .fn()
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        return await cb({ save: mockSave, increment: mockIncrement });
      });

      const result = await courseWishService.toggleCourseWishStatus(
        courseId,
        userId,
        false,
      );

      expect(result).toBeUndefined();
      expect(mockSave).toBeCalledTimes(1);
      expect(mockIncrement).toBeCalledTimes(1);
    });

    it('찜 취소 하는 경우 중간엔티티 삭제 및 강의엔티티에 찜 개수 감소', async () => {
      const mockDelete = jest.fn().mockResolvedValue({ raw: [], affected: 1 });
      const mockDecrement = jest
        .fn()
        .mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        return await cb({ delete: mockDelete, decrement: mockDecrement });
      });

      const result = await courseWishService.toggleCourseWishStatus(
        courseId,
        userId,
        true,
      );

      expect(result).toBeUndefined();
      expect(mockDelete).toBeCalledTimes(1);
      expect(mockDecrement).toBeCalledTimes(1);
    });
  });
});
