import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartCourseService } from 'src/cart_course/cart_course.service';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateCartDto } from './dtos/create-cart.dto';
import { CartEntity } from './entities/cart.entity';
import { CourseService } from 'src/course/course.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,

    private readonly cartCourseService: CartCourseService,
    private readonly courseService: CourseService,
  ) {}

  async findOneByOptions(options: FindOneOptions<CartEntity>) {
    const cart: CartEntity | null = await this.cartRepository.findOne(options);

    return cart;
  }

  async findMyCart(userId: string) {
    const q = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cartsCourses', 'cartsCourses')
      .leftJoinAndSelect('cartsCourses.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('cart.fk_user_id = :userId', { userId })
      .getOne();

    return q;
  }

  async createCart(userId: string) {
    return await this.cartRepository.save({
      fk_user_id: userId,
    });
  }

  async create(createCartDto: CreateCartDto, userId: string) {
    const { courseId } = createCartDto;

    let cart = await this.findOneByOptions({
      where: { fk_user_id: userId },
    });

    if (!cart) {
      cart = await this.createCart(userId);
    }

    await this.cartCourseService.insertCourseInCart(courseId, cart);

    return cart;
  }

  async delete(courseId: string, userId: string) {
    const cart = await this.findOneByOptions({
      where: { fk_user_id: userId },
    });

    if (!cart) {
      throw new NotFoundException('장바구니가 존재하지 않습니다.');
    }

    const result = await this.cartCourseService.deleteCourseInCart(
      courseId,
      cart.id,
    );

    return result.affected ? true : false;
  }

  async clearCartWithTransaction(
    userId: string,
    courseIds: string[],
    transactionManager: EntityManager,
  ) {
    const cart = await transactionManager.findOne(CartEntity, {
      where: { fk_user_id: userId },
    });

    if (!cart) {
      throw new NotFoundException('장바구니가 존재하지 않습니다.');
    }

    await Promise.all(
      courseIds.map(async (courseId) => {
        return await this.cartCourseService.deleteCourseInCart(
          courseId,
          cart.id,
          transactionManager,
        );
      }),
    );
  }
}
