import { Test, TestingModule } from '@nestjs/testing';
import { CourseUserService } from '@src/course_user/course-user.service';
import { EntityManager, Repository } from 'typeorm';
import { CourseUserEntity } from '@src/course_user/entities/course-user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserMyCourseQueryDto } from '@src/user/dtos/user.query.dto';
import { ForbiddenException } from '@nestjs/common';
import { mockCourseUserRepository } from '@test/__mocks__/mock-repository';
import {
  mockCourseUserWithFree,
  mockCourseUserWithPaid,
  mockPaidCourse,
} from '@test/__mocks__/mock-data';
import { PageMetaDto } from '@src/common/dtos/page-meta.dto';
import { PageDto } from '@src/common/dtos/page.dto';

describe('CourseUserService', () => {
  let courseUserService: CourseUserService;
  let courseUserRepository: Repository<CourseUserEntity>;

  const userId = 'uuid';
  const courseId = 'uuid';
  const courseUserId = 'uuid';
  const courseIds = ['uuid1'];
  const mockEntityManager = {
    save: jest.fn(),
    delete: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseUserService,
        {
          provide: getRepositoryToken(CourseUserEntity),
          useValue: mockCourseUserRepository,
        },
      ],
    }).compile();

    courseUserService = module.get<CourseUserService>(CourseUserService);
    courseUserRepository = module.get<Repository<CourseUserEntity>>(
      getRepositoryToken(CourseUserEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(courseUserService).toBeDefined();
    expect(courseUserRepository).toBeDefined();
  });

  describe('[내가 수강하는 강의 리스트 조회 로직 테스트]', () => {
    let query: UserMyCourseQueryDto;
    const mockCourseUserList = [
      [
        {
          id: mockCourseUserWithPaid.id,
          type: mockCourseUserWithPaid.type,
          created_at: mockCourseUserWithPaid.created_at,
          course: mockPaidCourse,
        },
      ],
      1,
    ] as [CourseUserEntity[], number];
    const pageMeta = new PageMetaDto({
      pageOptionDto: new UserMyCourseQueryDto(),
      itemCount: mockCourseUserList[1],
    });
    const expectedCourseUserList = new PageDto(mockCourseUserList[0], pageMeta);

    beforeEach(() => {
      query = new UserMyCourseQueryDto();
    });

    it('조회 성공', async () => {
      jest
        .spyOn(courseUserRepository.createQueryBuilder(), 'getManyAndCount')
        .mockResolvedValue(mockCourseUserList);

      const result = await courseUserService.findMyCourses(query, userId);

      expect(result).toEqual(expectedCourseUserList);
      expect(
        courseUserRepository.createQueryBuilder().leftJoinAndSelect,
      ).toBeCalledTimes(1);
      expect(courseUserRepository.createQueryBuilder().where).toBeCalledTimes(
        1,
      );
      expect(courseUserRepository.createQueryBuilder().take).toBeCalledTimes(1);
      expect(courseUserRepository.createQueryBuilder().skip).toBeCalledTimes(1);
      expect(courseUserRepository.createQueryBuilder().orderBy).toBeCalledTimes(
        1,
      );
      expect(
        courseUserRepository.createQueryBuilder().getManyAndCount,
      ).toBeCalledTimes(1);
    });

    it('검색 필터 호출 확인 - 검색어', async () => {
      const s = '검색어';
      query.s = s;

      await courseUserService.findMyCourses(query, userId);

      expect(
        courseUserRepository.createQueryBuilder().andWhere,
      ).toBeCalledTimes(1);
      expect(courseUserRepository.createQueryBuilder().andWhere).toBeCalledWith(
        'LOWER(course.title) LIKE LOWER(:title)',
        {
          title: `%${s.toLowerCase()}%`,
        },
      );
    });
  });

  describe('saveCourseUserRepo 테스트 - 주문완료 시 중간테이블(강의-유저)에 저장', () => {
    it('성공 - EntityManager 없이', async () => {
      jest
        .spyOn(courseUserRepository, 'save')
        .mockResolvedValue(mockCourseUserWithPaid);

      const result = await courseUserService.saveCourseUserRepo(
        courseIds,
        userId,
      );

      expect(result).toEqual([mockCourseUserWithPaid]);
    });

    it('성공 - EntityManager 포함', async () => {
      jest
        .spyOn(mockEntityManager, 'save')
        .mockResolvedValue(mockCourseUserWithPaid);

      const result = await courseUserService.saveCourseUserRepo(
        courseIds,
        userId,
        mockEntityManager,
      );

      expect(result).toEqual([mockCourseUserWithPaid]);
    });
  });

  describe('saveFreeCourseUserRepo 테스트 - 무료강의 신청시 중간테이블(강의-유저)에 저장', () => {
    it('성공 - EntityManager 포함', async () => {
      jest
        .spyOn(mockEntityManager, 'save')
        .mockResolvedValue(mockCourseUserWithFree);

      const result = await courseUserService.saveFreeCourseUserRepo(
        courseId,
        userId,
        mockEntityManager,
      );

      expect(result).toEqual(mockCourseUserWithFree);
    });
  });

  describe('cancelFreeCourseUserRepo 테스트 - 무료강의 취소시 중간테이블(강의-유저) 삭제', () => {
    it('성공', async () => {
      jest
        .spyOn(mockEntityManager, 'delete')
        .mockResolvedValue({ raw: [], affected: 1 });

      const result = await courseUserService.cancelFreeCourseUserRepo(
        courseUserId,
        mockEntityManager,
      );

      expect(result).toEqual({ raw: [], affected: 1 });
    });
  });

  describe('validateBoughtCourseByUser 테스트 - 유저가 강의 구매했는지 검증', () => {
    it('구매 안했다면 오류(403에러)', async () => {
      jest.spyOn(courseUserRepository, 'findOne').mockResolvedValue(null);

      try {
        await courseUserService.validateBoughtCourseByUser(userId, courseId);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('checkBoughtCourseByUser 테스트 - 유저가 강의 구매여부를 boolean으로 반환', () => {
    it('구매 했다면 true', async () => {
      jest
        .spyOn(courseUserRepository, 'findOne')
        .mockResolvedValue(mockCourseUserWithPaid);

      const result = await courseUserService.checkBoughtCourseByUser(
        userId,
        courseId,
      );

      expect(result).toBe(true);
    });

    it('구매 안했다면 false', async () => {
      jest.spyOn(courseUserRepository, 'findOne').mockResolvedValue(null);

      const result = await courseUserService.checkBoughtCourseByUser(
        userId,
        courseId,
      );

      expect(result).toBe(false);
    });
  });
});
