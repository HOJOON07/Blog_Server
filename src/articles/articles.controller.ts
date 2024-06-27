import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}
  // 1) GET / articles
  //    모든 articles를 다 가져온다.

  @Get()
  getArticles() {
    return this.articlesService.getAllArticles();
  }

  // 2) GET /articles/:id
  //    id에 해당하는 articles를 가져온다.
  @Get(':id')
  getArticle(@Param('id') id: string) {
    return this.articlesService.getArticleById(+id);
  }
  // POST /articles
  @Post()
  postArticle(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('contents') contents: string,
    @Body('description') description: string,
    @Body('isPrivate') isPrivate: boolean,
    @Body('isPublish') isPublish: boolean,
  ) {
    return this.articlesService.createArticle(
      authorId,
      title,
      description,
      contents,
      isPrivate,
      isPublish,
    );
  }

  @Put(':id')
  putArticle(
    @Param('id') id: number,
    @Body('title') title?: string,
    @Body('contents') contents?: string,
    @Body('description') description?: string,
    @Body('isPrivate') isPrivate?: boolean,
    @Body('isPublish') isPublish?: boolean,
  ) {
    return this.articlesService.updateArticle(
      id,
      title,
      contents,
      description,
      isPrivate,
      isPublish,
    );
  }
  @Delete(':id')
  deleteArticle(@Param('id') id: string) {
    return this.articlesService.deleteArticle(+id);
  }
}
