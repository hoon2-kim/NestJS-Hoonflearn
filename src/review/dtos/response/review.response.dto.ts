import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SimpleCourseResponseDto } from '@src/course/dtos/response/course.response';
import { ISimpleCourseResponse } from '@src/course/interfaces/course.interface';
import { ReviewCommentResponseDto } from '@src/review-comment/dtos/response/review-comment.response.dto';
import { IReviewCommentResponse } from '@src/review-comment/interfaces/review-comment.interface';
import { ReviewEntity } from '@src/review/entities/review.entity';
import {
  IReviewWithCommentResponse,
  IReviewWithOutCommentResponse,
} from '@src/review/interfaces/review.interface';
import { SimpleUserResponseDto } from '@src/user/dtos/response/user.response';
import { ISimpleUserResponse } from '@src/user/interfaces/user.interface';

export class ReviewResponseWithoutCommentDto
  implements IReviewWithOutCommentResponse
{
  @ApiProperty({ description: '리뷰 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '리뷰 내용', type: 'string' })
  contents: string;

  @ApiProperty({ description: '리뷰 점수', type: 'number' })
  rating: number;

  @ApiProperty({ description: '리뷰 좋아요 수', type: 'number' })
  likeCount: number;

  @ApiProperty({
    description: '리뷰 작성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({ description: '리뷰 작성자 정보', type: SimpleUserResponseDto })
  user: ISimpleUserResponse;

  @ApiPropertyOptional({
    description: '리뷰 작성한 강의 정보',
    type: SimpleCourseResponseDto,
  })
  course?: ISimpleCourseResponse;

  static from(review: ReviewEntity): ReviewResponseWithoutCommentDto {
    const dto = new ReviewResponseWithoutCommentDto();
    const { id, contents, rating, likeCount, created_at, user, course } =
      review;

    dto.id = id;
    dto.contents = contents;
    dto.rating = rating;
    dto.likeCount = likeCount;
    dto.created_at = created_at;
    dto.user = SimpleUserResponseDto.from(user);
    dto.course = course ? SimpleCourseResponseDto.from(course) : null;

    return dto;
  }
}

export class ReviewResponseWithCommentDto
  extends ReviewResponseWithoutCommentDto
  implements IReviewWithCommentResponse
{
  @ApiProperty({
    description: '리뷰 댓글 정보',
    type: ReviewCommentResponseDto,
    isArray: true,
  })
  comments: IReviewCommentResponse[];

  static from(review: ReviewEntity): ReviewResponseWithCommentDto {
    // super로 복사 후 as로 타입변환(확장의 개념)
    const dto = super.from(review) as ReviewResponseWithCommentDto;

    dto.comments = review.reviewComments?.map((comment) =>
      ReviewCommentResponseDto.from(comment),
    );

    return dto;
  }
}
