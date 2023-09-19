import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionReCommentDto } from './dtos/request/create-question-recomment.dto';
import { UpdateQuestionReCommentDto } from './dtos/request/update-question-recomment.dto';
import { QuestionCommentEntity } from './entities/question-comment.entity';

@Injectable()
export class QuestionRecommentService {
  constructor(
    @InjectRepository(QuestionCommentEntity)
    private readonly questionCommentRepository: Repository<QuestionCommentEntity>,
  ) {}

  async create(
    commentId: string,
    createQuestionReCommentDto: CreateQuestionReCommentDto,
    userId: string,
  ): Promise<QuestionCommentEntity> {
    const { contents } = createQuestionReCommentDto;

    const isExistComment = await this.questionCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!isExistComment) {
      throw new NotFoundException('부모 댓글이 존재하지 않습니다.');
    } else if (isExistComment.fk_question_comment_parentId !== null) {
      throw new BadRequestException('대댓글 까지만 가능합니다.');
    }

    const result = await this.questionCommentRepository.save({
      contents,
      fk_question_id: isExistComment.fk_question_id,
      fk_question_comment_parentId: commentId,
      fk_user_id: userId,
    });

    return result;
  }

  async update(
    reCommentId: string,
    updateQuestionReCommentDto: UpdateQuestionReCommentDto,
    userId: string,
  ): Promise<void> {
    const reComment = await this.questionCommentRepository.findOne({
      where: { id: reCommentId },
    });

    if (!reComment) {
      throw new NotFoundException('해당 대댓글이 존재하지 않습니다.');
    }

    if (reComment.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 수정 가능합니다.');
    }

    Object.assign(reComment, updateQuestionReCommentDto);

    await this.questionCommentRepository.save(reComment);
  }

  async delete(reCommentId: string, userId: string): Promise<boolean> {
    const reComment = await this.questionCommentRepository.findOne({
      where: { id: reCommentId },
    });

    if (!reComment) {
      throw new NotFoundException('해당 대댓글이 존재하지 않습니다.');
    }

    if (reComment.fk_user_id !== userId) {
      throw new ForbiddenException('본인만 삭제 가능합니다.');
    }

    const result = await this.questionCommentRepository.delete({
      id: reCommentId,
    });

    return result.affected ? true : false;
  }
}
