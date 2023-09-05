import { ISimpleUserResponse } from 'src/user/interfaces/user.interface';

export interface IQuestionCommentResponse {
  id: string;
  contents: string;
  created_at: Date;
  updated_at: Date;
  parentId?: string;
  user: ISimpleUserResponse;
  reComments?: IQuestionCommentResponse[];
}
