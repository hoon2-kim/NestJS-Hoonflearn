import { Module } from '@nestjs/common';
import { CategoryService } from '@src/category/category.service';
import { CategoryController } from '@src/category/category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '@src/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
