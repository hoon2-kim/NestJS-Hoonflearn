import { NotFoundException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionService } from 'src/question/question.service';
import { Repository } from 'typeorm';
import { CreateQuestionCommentDto } from './dtos/request/create-question-comment.dto';
import { UpdateQuestionCommentDto } from './dtos/request/update-question-comment.dto';
import { QuestionCommentEntity } from './entities/question-comment.entity';

@Injectable()
export class QuestionCommentService {
  constructor(
    @InjectRepository(QuestionCommentEntity)
    private readonly questionCommentRepository: Repository<QuestionCommentEntity>,

    private readonly questionService: QuestionService,
  ) {}

  async create(
    questionId: string,
    createQuestionCommentDto: CreateQuestionCommentDto,
    userId: string,
  ): Promise<QuestionCommentEntity> {
    const { contents } = createQuestionCommentDto;

    const question = await this.questionService.findOneByOptions({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('해당 질문글이 존재하지 않습니다.');
    }

    const newComment = await this.questionCommentRepository.save({
      contents,
      fk_user_id: userId,
      fk_question_id: questionId,
    });

    return newComment;
  }

  async update(
    questionId: string,
    commentId: string,
    updateQuestionCommentDto: UpdateQuestionCommentDto,
    userId: string,
  ): Promise<void> {
    const question = await this.questionService.findOneByOptions({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('해당 질문글이 존재하지 않습니다.');
    }

    const comment = await this.questionCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('해당 질문글의 댓글이 존재하지 않습니다.');
    }

    if (comment.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 수정이 가능합니다.');
    }

    Object.assign(comment, updateQuestionCommentDto);

    await this.questionCommentRepository.save(comment);
  }

  async delete(
    questionId: string,
    commentId: string,
    userId: string,
  ): Promise<boolean> {
    const question = await this.questionService.findOneByOptions({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('해당 질문글이 존재하지 않습니다.');
    }

    const comment = await this.questionCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('해당 질문글의 댓글이 존재하지 않습니다.');
    }

    if (comment.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 삭제가 가능합니다.');
    }

    const result = await this.questionCommentRepository.delete({
      id: commentId,
    });

    return result.affected ? true : false;
  }
}
