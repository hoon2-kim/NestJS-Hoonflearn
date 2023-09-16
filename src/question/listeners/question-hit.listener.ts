import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionEntity } from '../entities/question.entity';

export const QUESTION_HIT_EVENT = 'question.hit';

@Injectable()
export class QuestionHitListener {
  private readonly logger = new Logger(QuestionHitListener.name);

  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
  ) {}

  @OnEvent(QUESTION_HIT_EVENT)
  increaseQuestionHit({ questionId }: { questionId: string }): void {
    try {
      this.questionRepository.update(
        { id: questionId },
        { views: () => 'views + 1' },
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
