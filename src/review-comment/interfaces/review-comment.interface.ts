import { ISimpleUserResponse } from 'src/user/interfaces/user.interface';

export interface IReviewCommentResponse {
  id: string;
  contents: string;
  created_at: Date;
  user: ISimpleUserResponse;
}
