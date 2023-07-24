import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewModule } from 'src/review/review.module';
import { ReviewCommentEntity } from './entities/review-comment.entity';
import { ReviewCommentController } from './review-comment.controller';
import { ReviewCommentService } from './review-comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewCommentEntity]), ReviewModule],
  controllers: [ReviewCommentController],
  providers: [ReviewCommentService],
})
export class ReviewCommentModule {}
