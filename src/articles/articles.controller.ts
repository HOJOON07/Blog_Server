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

interface ArticlesModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let articles: ArticlesModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 999,
    commentCount: 10000,
  },
  {
    id: 2,
    author: 'newjeans_official',
    title: '뉴진스 해린',
    content: '메이크업 고치고 있는 해린',
    likeCount: 999,
    commentCount: 10000,
  },
  {
    id: 3,
    author: 'newjeans_official',
    title: '뉴진스 다니엘',
    content: '메이크업 고치고 있는 다니엘',
    likeCount: 999,
    commentCount: 10000,
  },
  {
    id: 4,
    author: 'blackpink_official',
    title: '블랙핑크 로제',
    content: '메이크업 고치고 있는 로제',
    likeCount: 999,
    commentCount: 10000,
  },
];

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}
  // 1) GET / articles
  //    모든 articles를 다 가져온다.

  @Get()
  getArticles() {
    return articles;
  }

  // 2) GET /articles/:id
  //    id에 해당하는 articles를 가져온다.
  @Get(':id')
  getArticle(@Param('id') id: string) {
    const article = articles.find((article) => article.id === +id);

    if (article === undefined) {
      throw new NotFoundException();
    }

    return article;
  }
  // POST /articles
  @Post()
  postArticle(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const article: ArticlesModel = {
      id: articles[articles.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    articles = [...articles, article];

    return article;
  }

  @Put(':id')
  putArticle(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const article = articles.find((article) => article.id == +id);

    if (article == undefined) {
      throw new NotFoundException();
    }

    if (author) {
      article.author = author;
    }

    if (title) {
      article.title = title;
    }

    if (content) {
      article.content = content;
    }

    articles = articles.map((prevArticle) =>
      prevArticle.id === +id ? article : prevArticle,
    );
    return article;
  }
  @Delete(':id')
  deleteArticle(@Param('id') id: string) {
    articles = articles.filter((article) => article.id !== +id);

    return id;
  }
}
