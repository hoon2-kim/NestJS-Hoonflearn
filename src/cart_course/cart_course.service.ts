import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '@src/cart/entities/cart.entity';
import { CourseService } from '@src/course/course.service';
import {
  DeleteResult,
  EntityManager,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CartCourseEntity } from '@src/cart_course/entities/cart-course.entity';

@Injectable()
export class CartCourseService {
  constructor(
    @InjectRepository(CartCourseEntity)
    private readonly cartCourseRepository: Repository<CartCourseEntity>,

    private readonly courseService: CourseService,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<CartCourseEntity>,
  ): Promise<CartCourseEntity | null> {
    const cartCourse: null | CartCourseEntity =
      await this.cartCourseRepository.findOne(options);

    return cartCourse;
  }

  async insertCourseInCart(
    courseId: string,
    cart: CartEntity,
  ): Promise<CartCourseEntity> {
    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('해당 강의가 존재하지 않습니다.');
    }

    const cartCourse = await this.findOneByOptions({
      where: {
        fk_cart_id: cart.id,
        fk_course_id: courseId,
      },
    });

    if (cartCourse) {
      throw new BadRequestException('이미 장바구니에 강의를 넣으셨습니다.');
    }

    return await this.cartCourseRepository.save({
      fk_course_id: courseId,
      fk_cart_id: cart.id,
    });
  }

  async deleteCourseInCart(
    cartId: string,
    courseId: string,
    manager?: EntityManager,
  ): Promise<DeleteResult> {
    const courseInCart = await this.findCourseInCart(cartId, courseId, manager);

    if (!courseInCart) {
      throw new NotFoundException(
        `장바구니에 해당 강의ID:${courseId}가 들어있지 않습니다.`,
      );
    }

    return manager
      ? await manager.delete(CartCourseEntity, {
          fk_cart_id: cartId,
          fk_course_id: courseId,
        })
      : await this.cartCourseRepository.delete({
          fk_cart_id: cartId,
          fk_course_id: courseId,
        });
  }

  private async findCourseInCart(
    cartId: string,
    courseId: string,
    manager?: EntityManager,
  ): Promise<CartCourseEntity | null> {
    const queryOption = {
      where: {
        fk_cart_id: cartId,
        fk_course_id: courseId,
      },
    };

    return manager
      ? await manager.findOne(CartCourseEntity, queryOption)
      : await this.findOneByOptions(queryOption);
  }
}
