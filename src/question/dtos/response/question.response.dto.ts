import { ApiProperty } from '@nestjs/swagger';
import { SimpleCourseResponseDto } from 'src/course/dtos/response/course.response';
import { ISimpleCourseResponse } from 'src/course/interfaces/course.interface';
import { QuestionCommentResponseDto } from 'src/question-comment/dtos/response/question-comment.response.dto';
import { IQuestionCommentResponse } from 'src/question-comment/interfaces/question-comment.interface';
import { SimpleUserResponseDto } from 'src/user/dtos/response/user.response';
import { ISimpleUserResponse } from 'src/user/interfaces/user.interface';
import { QuestionEntity } from '../../entities/question.entity';
import { EQuestionStatus } from '../../enums/question.enum';
import {
  IQuestionListResponse,
  IQuestionDetailResponse,
} from '../../interfaces/question.interface';

export class QuestionListResponseDto implements IQuestionListResponse {
  @ApiProperty({ description: '질문글 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '질문글 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '질문글 댓글 수', type: 'number' })
  commentCount: number;

  @ApiProperty({ description: '질문글 좋아요 수', type: 'number' })
  likeCount: number;

  @ApiProperty({
    description: '질문글 상태',
    enum: EQuestionStatus,
    enumName: 'EQuestionStatus',
  })
  questionStatus: EQuestionStatus;

  @ApiProperty({ description: '질문글 조회수', type: 'number' })
  views: number;

  @ApiProperty({
    description: '질문근 생성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: '질문글 저자(아이디,닉네임)',
    type: SimpleUserResponseDto,
  })
  user: ISimpleUserResponse;

  @ApiProperty({
    description: '질문글에 해당하는 강의(아이디,제목)',
    type: SimpleCourseResponseDto,
  })
  course: ISimpleCourseResponse;

  static from(question: QuestionEntity): QuestionListResponseDto {
    const dto = new QuestionListResponseDto();
    const {
      id,
      title,
      commentCount,
      likeCount,
      questionStatus,
      views,
      created_at,
    } = question;

    dto.id = id;
    dto.title = title;
    dto.commentCount = commentCount;
    dto.likeCount = likeCount;
    dto.questionStatus = questionStatus;
    dto.views = views;
    dto.created_at = created_at;
    dto.user = SimpleUserResponseDto.from(question.user);
    dto.course = SimpleCourseResponseDto.from(question.course);

    return dto;
  }
}

export class QuestionDetailResponseDto implements IQuestionDetailResponse {
  @ApiProperty({ description: '질문글 ID', type: 'string' })
  id: string;

  @ApiProperty({ description: '질문글 제목', type: 'string' })
  title: string;

  @ApiProperty({ description: '질문글 내용', type: 'string' })
  contents: string;

  @ApiProperty({ description: '질문글 댓글 수', type: 'number' })
  commentCount: number;

  @ApiProperty({ description: '질문글 좋아요 수', type: 'number' })
  likeCount: number;

  @ApiProperty({
    description: '질문글 상태',
    enum: EQuestionStatus,
    enumName: 'EQuestionStatus',
  })
  questionStatus: EQuestionStatus;

  @ApiProperty({ description: '질문글 조회수', type: 'number' })
  views: number;

  @ApiProperty({
    description: '질문근 생성일',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: '질문글 저자(아이디,닉네임)',
    type: SimpleUserResponseDto,
  })
  user: ISimpleUserResponse;

  @ApiProperty({
    description: '질문글에 해당하는 강의(아이디,제목)',
    type: SimpleCourseResponseDto,
  })
  course: ISimpleCourseResponse;

  @ApiProperty({
    description: '질문글의 댓글과 대댓글',
    type: QuestionCommentResponseDto,
    isArray: true,
  })
  comments: IQuestionCommentResponse[];

  static from(question: QuestionEntity): QuestionDetailResponseDto {
    const dto = new QuestionDetailResponseDto();
    const {
      id,
      title,
      contents,
      commentCount,
      likeCount,
      questionStatus,
      views,
      created_at,
    } = question;

    dto.id = id;
    dto.title = title;
    dto.contents = contents;
    dto.commentCount = commentCount;
    dto.likeCount = likeCount;
    dto.questionStatus = questionStatus;
    dto.views = views;
    dto.created_at = created_at;
    dto.user = SimpleUserResponseDto.from(question.user);
    dto.course = SimpleCourseResponseDto.from(question.course);
    dto.comments = question.questionComments?.map((comment) =>
      QuestionCommentResponseDto.from(comment),
    );

    return dto;
  }
}
