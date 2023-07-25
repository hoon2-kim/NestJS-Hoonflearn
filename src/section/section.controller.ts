import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/role-protected.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';
import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
import { SectionService } from './section.service';

@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  createSection(
    @Body() createSectionDto: CreateSectionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.sectionService.create(createSectionDto, user);
  }

  @Patch('/:sectionId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.sectionService.update(sectionId, updateSectionDto, user);
  }

  @Delete('/:sectionId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteSection(
    @Param('sectionId') sectionId: string, //
    @CurrentUser() user: UserEntity,
  ) {
    return this.sectionService.delete(sectionId, user);
  }
}
