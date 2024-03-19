import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewLikeEntity } from '@src/review/review-like/entities/review-like.entity';
import { ReviewLikeService } from '@src/review/review-like/review-like.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewLikeEntity])],
  providers: [ReviewLikeService],
  exports: [ReviewLikeService],
})
export class ReviewLikeModule {}
