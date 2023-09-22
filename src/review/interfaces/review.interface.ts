import { ISimpleCourseResponse } from '@src/course/interfaces/course.interface';
import { IReviewCommentResponse } from '@src/review-comment/interfaces/review-comment.interface';
import { ISimpleUserResponse } from '@src/user/interfaces/user.interface';

export interface IReviewWithOutCommentResponse {
  id: string;
  contents: string;
  rating: number;
  likeCount: number;
  created_at: Date;
  user: ISimpleUserResponse;
  course: ISimpleCourseResponse;
}

export interface IReviewWithCommentResponse
  extends IReviewWithOutCommentResponse {
  comments: IReviewCommentResponse[];
}
