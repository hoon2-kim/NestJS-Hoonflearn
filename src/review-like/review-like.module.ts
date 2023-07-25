import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewLikeEntity } from './entities/review-like.entity';
import { ReviewLikeService } from './review-like.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewLikeEntity])],
  providers: [ReviewLikeService],
  exports: [ReviewLikeService],
})
export class ReviewLikeModule {}
