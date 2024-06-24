import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.articlesService.createArticle(author, title, content);
  }

  @Put(':id')
  putArticle(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.articlesService.updateArticle(+id, author, title, content);
  }
  @Delete(':id')
  deleteArticle(@Param('id') id: string) {
    return this.articlesService.deleteArticle(+id);
  }
}
