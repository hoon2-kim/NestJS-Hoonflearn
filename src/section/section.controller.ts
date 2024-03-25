import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { Roles } from '@src/auth/decorators/role-protected.decorator';
import { AtGuard } from '@src/auth/guards/at.guard';
import { RoleGuard } from '@src/auth/guards/role.guard';
import { ERoleType } from '@src/user/enums/user.enum';
import { CreateSectionDto } from '@src/section/dtos/create-section.dto';
import { UpdateSectionDto } from '@src/section/dtos/update-section.dto';
import { SectionEntity } from '@src/section/entities/section.entity';
import { SectionService } from '@src/section/section.service';
import {
  ApiCreateSectionSwagger,
  ApiDeleteSectionSwagger,
  ApiUpdateSectionSwagger,
} from './section.swagger';

@ApiTags('SECTION')
@Roles(ERoleType.Instructor)
@UseGuards(AtGuard, RoleGuard)
@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @ApiCreateSectionSwagger('섹션 생성')
  @Post()
  async createSection(
    @Body() createSectionDto: CreateSectionDto,
    @CurrentUser('id') userId: string,
  ): Promise<SectionEntity> {
    return await this.sectionService.create(createSectionDto, userId);
  }

  @ApiUpdateSectionSwagger('섹션 수정')
  @Patch('/:sectionId')
  async updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.sectionService.update(
      sectionId,
      updateSectionDto,
      userId,
    );
  }

  @ApiDeleteSectionSwagger('섹션 삭제')
  @Delete('/:sectionId')
  async deleteSection(
    @Param('sectionId') sectionId: string, //
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return await this.sectionService.delete(sectionId, userId);
  }
}
