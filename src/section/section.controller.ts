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
import { AtGuard } from 'src/auth/guard/at.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionService } from './section.service';

@Controller('')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post('courses/:courseId/sections')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  createSection(
    @Param('courseId') courseId: string,
    @Body() createSectionDto: CreateSectionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.sectionService.create(courseId, createSectionDto, user);
  }

  @Patch('sections/:sectionId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.sectionService.update(sectionId, updateSectionDto, user);
  }

  @Delete('sections/:sectionId')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  deleteSection(
    @Param('sectionId') sectionId: string, //
    @CurrentUser() user: UserEntity,
  ) {
    return this.sectionService.delete(sectionId, user);
  }
}
