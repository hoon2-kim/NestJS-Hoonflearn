import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartCourseService } from '@src/cart_course/cart_course.service';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { CreateCartDto } from '@src/cart/dtos/request/create-cart.dto';
import { CartEntity } from '@src/cart/entities/cart.entity';
import { CourseService } from '@src/course/course.service';
import { NotFoundException } from '@nestjs/common';
import { CartResponseDto } from '@src/cart/dtos/response/cart.response.dto';
import { CourseUserService } from '@src/course_user/course-user.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,

    private readonly cartCourseService: CartCourseService,
    private readonly courseService: CourseService,
    private readonly courseUserService: CourseUserService,
  ) {}

  async findOneByOptions(
    options: FindOneOptions<CartEntity>,
  ): Promise<CartEntity | null> {
    const cart: CartEntity | null = await this.cartRepository.findOne(options);

    return cart;
  }

  async findMyCart(userId: string): Promise<CartResponseDto> {
    let cart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cartsCourses', 'cartsCourses')
      .leftJoinAndSelect('cartsCourses.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('cart.fk_user_id = :userId', { userId })
      .getOne();

    if (!cart) {
      cart = await this.createCart(userId);
    }

    const courseIds = cart.cartsCourses?.map((c) => c.fk_course_id);

    const total_price = await this.courseService.calculateCoursePriceInCart(
      courseIds,
    );

    return CartResponseDto.from(cart, total_price);
  }

  async createCart(userId: string): Promise<CartEntity> {
    return await this.cartRepository.save({
      fk_user_id: userId,
    });
  }

  async create(
    createCartDto: CreateCartDto,
    userId: string,
  ): Promise<CartEntity> {
    const { courseId } = createCartDto;

    let cart = await this.findOneByOptions({
      where: { fk_user_id: userId },
    });

    if (!cart) {
      cart = await this.createCart(userId);
    }

    // 0원인 강의는 장바구니에 담지 말기
    const course = await this.courseService.findOneByOptions({
      where: { id: courseId },
    });

    if (course.price === 0) {
      throw new BadRequestException(
        '무료인 강의는 장바구니에 담을 수 없습니다.',
      );
    }

    const isBoughtCourse = await this.courseUserService.checkBoughtCourseByUser(
      userId,
      courseId,
    );

    if (isBoughtCourse) {
      throw new BadRequestException('이미 구매하신 강의입니다.');
    }

    await this.cartCourseService.insertCourseInCart(courseId, cart);

    return cart;
  }

  async delete(courseId: string, userId: string): Promise<boolean> {
    const cart = await this.findOneByOptions({
      where: { fk_user_id: userId },
    });

    if (!cart) {
      throw new NotFoundException('장바구니가 존재하지 않습니다.');
    }

    const result = await this.cartCourseService.deleteCourseInCart(
      cart.id,
      courseId,
    );

    return result.affected ? true : false;
  }

  async clearCartWithTransaction(
    userId: string,
    courseIds: string[],
    manager: EntityManager,
  ): Promise<void> {
    const cart = await manager.findOne(CartEntity, {
      where: { fk_user_id: userId },
    });

    if (!cart) {
      throw new NotFoundException('장바구니가 존재하지 않습니다.');
    }

    await Promise.all(
      courseIds.map(async (courseId) => {
        return await this.cartCourseService.deleteCourseInCart(
          cart.id,
          courseId,
          manager,
        );
      }),
    );
  }

  async removeCart(userId: string): Promise<void> {
    // TODO : 장바구니 여부

    await this.cartRepository.delete({ fk_user_id: userId });
  }
}
