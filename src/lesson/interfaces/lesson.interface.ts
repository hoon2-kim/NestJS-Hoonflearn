import { IVideoResponse } from '@src/video/interfaces/video.interface';

export interface ILessonResponse {
  id: string;
  title: string;
  note?: string;
  isFreePublic: boolean;
  created_at: Date;
  video?: IVideoResponse;
}
