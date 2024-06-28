import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreateArticleDto } from './dto/create-article-dto';
import { UpdateArticleDto } from './dto/update-article-dto';

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
  getArticle(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getArticleById(id);
  }
  // POST /articles
  @Post()
  @UseGuards(AccessTokenGuard)
  postArticle(@User('id') userId: number, @Body() body: CreateArticleDto) {
    return this.articlesService.createArticle(userId, body);
  }

  @Patch(':id')
  putArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.updateArticle(id, body);
  }
  @Delete(':id')
  deleteArticle(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.deleteArticle(id);
  }
}
