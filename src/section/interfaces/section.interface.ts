import { ILessonResponse } from '@src/lesson/interfaces/lesson.interface';

export interface ISectionResponse {
  id: string;
  title: string;
  goal: string;
  totalSectionTime: number;
  totalLessonBySectionCount: number;
  created_at: Date;
  lessons?: ILessonResponse[];
}
