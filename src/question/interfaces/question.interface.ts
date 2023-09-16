import { ISimpleCourseResponse } from 'src/course/interfaces/course.interface';
import { IQuestionCommentResponse } from 'src/question-comment/interfaces/question-comment.interface';
import { ISimpleUserResponse } from 'src/user/interfaces/user.interface';
import { EQuestionStatus } from '../enums/question.enum';

export interface IQuestionListResponse {
  id: string;
  title: string;
  questionStatus: EQuestionStatus;
  voteCount: number;
  commentCount: number;
  views: number;
  created_at: Date;
  user: ISimpleUserResponse;
  course: ISimpleCourseResponse;
}

export interface IQuestionDetailResponse {
  id: string;
  title: string;
  contents: string;
  questionStatus: EQuestionStatus;
  voteCount: number;
  commentCount: number;
  views: number;
  created_at: Date;
  user: ISimpleUserResponse;
  course: ISimpleCourseResponse;
  comments: IQuestionCommentResponse[];
}

export interface ICourseDashboardQuestionResponse {
  id: string;
  title: string;
  created_at: Date;
}
