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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role-protected.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserEntity } from 'src/user/entities/user.entity';
import { ERoleType } from 'src/user/enums/user.enum';
import { CreateSectionDto } from './dtos/request/create-section.dto';
import { UpdateSectionDto } from './dtos/request/update-section.dto';
import { SectionEntity } from './entities/section.entity';
import { SectionService } from './section.service';
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
    @CurrentUser() user: UserEntity,
  ): Promise<SectionEntity> {
    return this.sectionService.create(createSectionDto, user);
  }

  @ApiUpdateSectionSwagger('섹션 수정')
  @Patch('/:sectionId')
  async updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    return this.sectionService.update(sectionId, updateSectionDto, user);
  }

  @ApiDeleteSectionSwagger('섹션 삭제')
  @Delete('/:sectionId')
  async deleteSection(
    @Param('sectionId') sectionId: string, //
    @CurrentUser() user: UserEntity,
  ): Promise<boolean> {
    return this.sectionService.delete(sectionId, user);
  }
}
