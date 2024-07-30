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
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreateArticleDto } from './dto/create-article-dto';
import { UpdateArticleDto } from './dto/update-article-dto';
import { PaginateArticleDto } from './dto/paginate-article.dto';
import { UserModel } from 'src/users/entities/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageModelType } from 'src/common/entities/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { ArticlesThumbnailService } from './thumbnail/dto/thumbnail.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { HttpExceptionFilter } from 'src/common/exception-filter/http-exception-filter';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { IsArticleMineOrAdminGuard } from './guard/is-article-mine-or-admin.guard';
import { PaginateWorkspaceArticleDto } from './dto/paginate-workspace-articles-dto';
import { PaginateUserPublicArticleDto } from './dto/paginate-user-public-article-dto';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly dataSource: DataSource,
    private readonly articlesThumbnailService: ArticlesThumbnailService,
  ) {}
  // 1) GET / articles
  //    모든 articles를 다 가져온다.

  @Get('author/:id')
  @UseInterceptors(LogInterceptor)
  @IsPublic()
  async getArticlesAuthor(@Param('id', ParseIntPipe) id: number) {
    return await this.articlesService.getArticlesAuthor(id);
  }

  @Get('users')
  @UseInterceptors(LogInterceptor)
  @IsPublic()
  getUserPublicArticles(
    @Query() query: PaginateUserPublicArticleDto,
    // @Query() devName: string,
  ) {
    return this.articlesService.paginateUserPublicArticles(query);
  }

  @Get('workspace')
  @UseInterceptors(LogInterceptor)
  getWorkspaceArticles(
    @Query() query: PaginateWorkspaceArticleDto,
    @User('id') userId: number,
  ) {
    return this.articlesService.paginateWorkspaceArticles(query, userId);
  }

  @Get()
  @IsPublic()
  @UseInterceptors(LogInterceptor)
  // @UseFilters(HttpExceptionFilter)
  getArticles(@Query() query: PaginateArticleDto) {
    return this.articlesService.paginateArticles(query);
  }

  // 2) GET /articles/:id
  //    id에 해당하는 articles를 가져온다.
  @Get(':id')
  @IsPublic()
  getArticleById(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getPublicArticleById(id);
  }

  // article Id를 주면 author 정보를 가져온다.
  @Get('workspace/:id')
  getWorkspaceArticleById(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getWorkspaceArticleById(id);
  }

  // @Post('random')
  // async postPostArticles(@User() user: UserModel) {
  //   await this.articlesService.generateArticles(user.id);

  //   return true;
  // }
  // POST /articles

  // POST API -> A모델을 정의하고 ,B모델을 저장한다.
  // await 1
  // await 2

  // 만약에 1을 하다가 실패하면 b를 저장하면 안될 경우 -> 안전 장치가 필요하다.
  // 트랜잭션이란 all or nothing

  // transaction
  // start -> 시작
  // commit -> 저장
  // rollback -> 원상 복구
  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postCreateArticle(
    @User('id') userId: number,
    @Body() body: CreateArticleDto,
    @QueryRunner() qr: QR,
  ) {
    const article = await this.articlesService.createArticle(userId, body, qr);

    for (let i = 0; i < body.thumbnails.length; i++) {
      await this.articlesThumbnailService.createArticleThumbnail(
        {
          article,
          order: i,
          path: body.thumbnails[i],
          type: ImageModelType.ARTICLE_IMAGE,
        },
        qr,
      );
    }
    return this.articlesService.getPrivateArticleById(article.id, qr);
  }

  @Patch(':articleId')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(IsArticleMineOrAdminGuard)
  async patchEditArticle(
    @Param('articleId', ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
    @QueryRunner() qr: QR,
  ) {
    const article = await this.articlesService.updateArticle(id, body, qr);

    for (let i = 0; i < body.thumbnails.length; i++) {
      await this.articlesThumbnailService.createArticleThumbnail(
        {
          article,
          order: i,
          path: body.thumbnails[i],
          type: ImageModelType.ARTICLE_IMAGE,
        },
        qr,
      );
    }
    return this.articlesService.getPrivateArticleById(article.id, qr);
  }
  @Delete(':id')
  @UseGuards(IsArticleMineOrAdminGuard)
  @Roles(RolesEnum.ADMIN)
  deleteArticle(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.deleteArticle(id);
  }
}
