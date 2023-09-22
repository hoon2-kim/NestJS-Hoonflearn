import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionCommentEntity } from '@src/question-comment/entities/question-comment.entity';
import { IQuestionCommentResponse } from '@src/question-comment/interfaces/question-comment.interface';
import { SimpleUserResponseDto } from '@src/user/dtos/response/user.response';
import { ISimpleUserResponse } from '@src/user/interfaces/user.interface';

export class QuestionCommentResponseDto implements IQuestionCommentResponse {
  @ApiProperty({
    description: '질문글 댓글 ID (대댓글일 경우 대댓글 ID)',
    type: 'string',
  })
  id: string;

  @ApiProperty({ description: '질문글 댓글 혹은 대댓글 내용', type: 'string' })
  contents: string;

  @ApiProperty({
    description: '질문글 댓글 혹은 대댓글 작성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: '질문글 댓글 혹은 대댓글 수정일',
    type: 'string',
    format: 'date-time',
  })
  updated_at: Date;

  @ApiPropertyOptional({
    description: '대댓글일 경우 부모댓글 ID',
    type: 'string',
  })
  parentId?: string;

  @ApiProperty({
    description: '댓글 혹은 대댓글 작성자 정보',
    type: SimpleUserResponseDto,
  })
  user: ISimpleUserResponse;

  @ApiProperty({
    description: '대댓글 정보',
    type: QuestionCommentResponseDto,
    isArray: true,
  })
  reComment: IQuestionCommentResponse[];

  static from(
    questionComment: QuestionCommentEntity,
  ): QuestionCommentResponseDto {
    const dto = new QuestionCommentResponseDto();
    const {
      id,
      contents,
      created_at,
      updated_at,
      fk_question_comment_parentId,
    } = questionComment;

    dto.id = id;
    dto.contents = contents;
    dto.created_at = created_at;
    dto.updated_at = updated_at;
    dto.parentId = fk_question_comment_parentId;
    dto.user = SimpleUserResponseDto.from(questionComment.user);
    dto.reComment = questionComment.reComments?.map((re) =>
      QuestionCommentResponseDto.from(re),
    );

    return dto;
  }
}
