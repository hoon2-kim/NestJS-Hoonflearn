import {
  Body,
  Controller,
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
import { CouponService } from './coupon.service';
import {
  ApiCreateCouponSwagger,
  ApiRegisterCouponSwagger,
  ApiUpdateCouponSwagger,
} from './coupon.swagger';
import { CreateCouponDto } from './dtos/create-coupon.dto';
import { RegisterCouponDto } from './dtos/register-coupon.dto';
import { UpdateCouponDto } from './dtos/update-coupon.dto';

@ApiTags('COUPON')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiCreateCouponSwagger('강사가 강의 쿠폰 생성')
  @Post('/instructors')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async createCourseCoupon(
    @Body() createCouponDto: CreateCouponDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.couponService.createCoupon(createCouponDto, userId);
  }

  @ApiRegisterCouponSwagger('유저가 강의 쿠폰 등록')
  @Post('/users')
  @UseGuards(AtGuard)
  async registerCoupon(
    @Body() registerCouponDto: RegisterCouponDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.couponService.registerCoupon(registerCouponDto, userId);
  }

  @ApiUpdateCouponSwagger('강사가 쿠폰 수정')
  @Patch('/:id')
  @Roles(ERoleType.Instructor)
  @UseGuards(AtGuard, RoleGuard)
  async updateCouponStatus(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.couponService.updateCouponStatus(
      id,
      updateCouponDto,
      userId,
    );
  }
}
