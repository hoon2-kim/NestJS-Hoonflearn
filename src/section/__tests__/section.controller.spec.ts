import { Test, TestingModule } from '@nestjs/testing';
import { SectionController } from '@src/section/section.controller';
import { SectionService } from '@src/section/section.service';
import {
  mockCreatedSection,
  mockSectionService,
  mockCreateSectionDto,
  mockUpdateSectionDto,
} from '@test/__mocks__/section.mock';

describe('SectionController', () => {
  let sectionController: SectionController;
  let sectionService: SectionService;

  const userId = 'uuid';
  const sectionId = 'uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionController],
      providers: [
        {
          provide: SectionService,
          useValue: mockSectionService,
        },
      ],
    }).compile();

    sectionController = module.get<SectionController>(SectionController);
    sectionService = module.get<SectionService>(SectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sectionController).toBeDefined();
    expect(sectionService).toBeDefined();
  });

  describe('[SectionController.createSection] - 섹션 생성', () => {
    it('섹션 생성 성공', async () => {
      jest
        .spyOn(sectionService, 'create')
        .mockResolvedValue(mockCreatedSection);

      const result = await sectionController.createSection(
        mockCreateSectionDto,
        userId,
      );

      expect(result).toEqual(mockCreatedSection);
      expect(sectionService.create).toHaveBeenCalled();
      expect(sectionService.create).toBeCalledWith(
        mockCreateSectionDto,
        userId,
      );
    });
  });

  describe('[SectionController.updateSection] - 섹션 수정', () => {
    const updateResult = { message: '수정 성공' };
    it('섹션 수정 성공', async () => {
      jest.spyOn(sectionService, 'update').mockResolvedValue(updateResult);

      const result = await sectionController.updateSection(
        sectionId,
        mockUpdateSectionDto,
        userId,
      );

      expect(result).toEqual(updateResult);
      expect(sectionService.update).toHaveBeenCalled();
      expect(sectionService.update).toBeCalledWith(
        sectionId,
        mockUpdateSectionDto,
        userId,
      );
    });
  });

  describe('[SectionController.deleteSection] - 섹션 삭제', () => {
    it('섹션 삭제 성공', async () => {
      jest.spyOn(sectionService, 'delete').mockResolvedValue(true);

      const result = await sectionController.deleteSection(
        sectionId,

        userId,
      );

      expect(result).toBe(true);
      expect(sectionService.delete).toHaveBeenCalled();
      expect(sectionService.delete).toBeCalledWith(sectionId, userId);
    });
  });
});
