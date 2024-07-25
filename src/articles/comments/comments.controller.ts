import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments-dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UserModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { isCommentMineOrAdminGuaer } from './guard/is-comments-mine-or-admin.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { ArticlesService } from '../articles.service';

@Controller('articles/:articleId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly articlesService: ArticlesService,
  ) {}

  @Get()
  @IsPublic()
  getComments(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query() query: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(query, articleId);
  }

  @Get(':commentId')
  @IsPublic()
  getComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() body: CreateCommentsDto,
    @User() user: UserModel,
    @QueryRunner() qr: QR,
  ) {
    const newComment = await this.commentsService.createComment(
      body,
      articleId,
      user,
      qr,
    );
    await this.articlesService.incrementCommentCount(articleId, qr);

    return newComment;
  }

  @Patch(':commentId')
  @UseGuards(isCommentMineOrAdminGuaer)
  async patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentsDto,
  ) {
    return this.commentsService.updateComment(body, commentId);
  }

  @Delete(':commentId')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(isCommentMineOrAdminGuaer)
  async deleteComment(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @QueryRunner() qr: QR,
  ) {
    const deleteComment = await this.commentsService.deleteComment(
      commentId,
      qr,
    );

    await this.articlesService.decrementCommentCount(articleId, qr);

    return deleteComment;
  }
}
