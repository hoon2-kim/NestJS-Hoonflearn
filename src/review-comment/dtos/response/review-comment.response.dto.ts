import { ApiProperty } from '@nestjs/swagger';
import { ReviewCommentEntity } from 'src/review-comment/entities/review-comment.entity';
import { IReviewCommentResponse } from 'src/review-comment/interfaces/review-comment.interface';
import { SimpleUserResponseDto } from 'src/user/dtos/response/user.response';
import { ISimpleUserResponse } from 'src/user/interfaces/user.interface';

export class ReviewCommentResponseDto implements IReviewCommentResponse {
  @ApiProperty({ description: '리뷰 댓글 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '리뷰 댓글 내용', type: 'string' })
  contents: string;

  @ApiProperty({
    description: '리뷰 댓글 작성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: '리뷰 댓글 작성자 정보',
    type: SimpleUserResponseDto,
  })
  user: ISimpleUserResponse;

  static from(reviewComment: ReviewCommentEntity) {
    const dto = new ReviewCommentResponseDto();
    const { id, contents, created_at, user } = reviewComment;

    dto.id = id;
    dto.contents = contents;
    dto.created_at = created_at;
    dto.user = SimpleUserResponseDto.from(user);

    return dto;
  }
}
