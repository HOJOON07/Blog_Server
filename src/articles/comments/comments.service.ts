import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { PaginateCommentsDto } from './dto/paginate-comments-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entities/comment.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { UserModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

  paginateComments(dto: PaginateCommentsDto, articleId: number) {
    const where = {
      article: { id: articleId },
    };
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        relations: {
          author: true,
        },
        select: {
          author: { id: true, devName: true },
        },
        ...where,
      },
      `articles/${articleId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException(`id : ${id} Comment는 존재하지 않습니다.`);
    }

    return comment;
  }

  async createComment(
    dto: CreateCommentsDto,
    articleId: number,
    author: UserModel,
    qr?: QueryRunner,
  ) {
    const commentsRepository = this.getRepository(qr);
    return commentsRepository.save({
      ...dto,
      article: {
        id: articleId,
      },
      author,
    });
  }

  async updateComment(dto: UpdateCommentsDto, commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다. DeleteService');
    }

    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    const newComment = await this.commentsRepository.save(prevComment);

    return newComment;
  }

  async deleteComment(id: number, qr?: QueryRunner) {
    const commentsRepository = this.getRepository(qr);
    const comment = await commentsRepository.findOne({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다. DeleteService');
    }
    return await commentsRepository.delete(id);
  }

  async isCommentsMine(userId: number, commentId: number) {
    return this.commentsRepository.exists({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}