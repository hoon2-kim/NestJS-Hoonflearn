import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { QuestionLikeEntity } from './entities/question-like.entity';

@Injectable()
export class QuestionLikeService {
  constructor(
    @InjectRepository(QuestionLikeEntity)
    private readonly questionLikeRepository: Repository<QuestionLikeEntity>,
  ) {}

  async findOneByOptions(options: FindOneOptions<QuestionLikeEntity>) {
    const questionLike: QuestionLikeEntity | null =
      await this.questionLikeRepository.findOne(options);

    return questionLike;
  }

  async addQuestionLike(questionId: string, userId: string) {
    await this.questionLikeRepository.save({
      fk_question_id: questionId,
      fk_user_id: userId,
    });
  }

  async cancelQuestionLike(questionId: string, userId: string) {
    await this.questionLikeRepository.delete({
      fk_question_id: questionId,
      fk_user_id: userId,
    });
  }
}
