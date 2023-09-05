import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { CourseService } from 'src/course/course.service';
import {
  DeleteResult,
  EntityManager,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { CartCourseEntity } from './entities/cart-course.entity';

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

    if (!cartCourse) {
      return await this.cartCourseRepository.save({
        fk_course_id: courseId,
        fk_cart_id: cart.id,
      });
    } else {
      throw new BadRequestException('이미 장바구니에 강의를 넣으셨습니다.');
    }
  }

  // TODO : 리팩토링
  async deleteCourseInCart(
    courseId: string,
    cartId: string,
    transactionManager?: EntityManager,
  ): Promise<DeleteResult> {
    if (transactionManager) {
      const existCourseInCart = await transactionManager.findOne(
        CartCourseEntity,
        {
          where: {
            fk_cart_id: cartId,
            fk_course_id: courseId,
          },
        },
      );

      if (!existCourseInCart) {
        throw new NotFoundException(
          '장바구니에 해당 강의가 들어있지 않습니다.',
        );
      }

      return await transactionManager.delete(CartCourseEntity, {
        fk_course_id: courseId,
        fk_cart_id: cartId,
      });
    } else {
      const existCourseInCart = await this.findOneByOptions({
        where: {
          fk_cart_id: cartId,
          fk_course_id: courseId,
        },
      });

      if (!existCourseInCart) {
        throw new NotFoundException(
          '장바구니에 해당 강의가 들어있지 않습니다.',
        );
      }

      return await this.cartCourseRepository.delete({
        fk_course_id: courseId,
        fk_cart_id: cartId,
      });
    }
  }
}
