import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dtos/create-instructor.dto';
import { UpdateInstructorDto } from './dtos/update-instructor.dto';
import { Roles } from 'src/auth/decorators/role-protected.decorator';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Response } from 'express';
import { IInstructorCreateResult } from './interfaces/instructor.interface';
import { RoleType, UserEntity } from 'src/user/entities/user.entity';

@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('/my-courses')
  @Roles(RoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  findMyCourses(
    @CurrentUser() user: UserEntity, //
  ) {
    return this.instructorService.findCourses(user);
  }

  @Post('register')
  @UseGuards(AtGuard)
  registerInstructor(
    @Body() createInstructorDto: CreateInstructorDto,
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IInstructorCreateResult> {
    return this.instructorService.create(createInstructorDto, user, res);
  }

  @Patch('/:instructorId')
  updateInstructor(
    @Param('instructorId') instructorId: string,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ) {
    return this.instructorService.update(instructorId, updateInstructorDto);
  }
}
