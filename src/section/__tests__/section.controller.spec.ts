import { Test, TestingModule } from '@nestjs/testing';
import { SectionController } from '@src/section/section.controller';
import { SectionService } from '@src/section/section.service';
import {
  mockSection,
  mockCreateSectionDto,
  mockUpdateSectionDto,
} from '@test/__mocks__/mock-data';
import { mockSectionService } from '@test/__mocks__/mock-service';

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
      jest.spyOn(sectionService, 'create').mockResolvedValue(mockSection);

      const result = await sectionController.createSection(
        mockCreateSectionDto,
        userId,
      );

      expect(result).toEqual(mockSection);
      expect(sectionService.create).toHaveBeenCalled();
      expect(sectionService.create).toBeCalledWith(
        mockCreateSectionDto,
        userId,
      );
    });
  });

  describe('[SectionController.updateSection] - 섹션 수정', () => {
    it('섹션 수정 성공', async () => {
      jest.spyOn(sectionService, 'update').mockResolvedValue(undefined);

      const result = await sectionController.updateSection(
        sectionId,
        mockUpdateSectionDto,
        userId,
      );

      expect(result).toBeUndefined();
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
      jest.spyOn(sectionService, 'delete').mockResolvedValue(undefined);

      const result = await sectionController.deleteSection(
        sectionId,

        userId,
      );

      expect(result).toBeUndefined();
      expect(sectionService.delete).toHaveBeenCalled();
      expect(sectionService.delete).toBeCalledWith(sectionId, userId);
    });
  });
});
