import { Injectable, NotFoundException } from '@nestjs/common';

export interface ArticlesModel {
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

@Injectable()
export class ArticlesService {
  getAllArticles() {
    return articles;
  }

  getArticleById(id: number) {
    const article = articles.find((article) => article.id === +id);

    if (article === undefined) {
      throw new NotFoundException();
    }

    return article;
  }

  createArticle(author: string, title: string, content: string) {
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

  updateArticle(
    articleId: number,
    author: string,
    title: string,
    content: string,
  ) {
    const article = articles.find((article) => article.id == articleId);

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
      prevArticle.id === articleId ? article : prevArticle,
    );
    return article;
  }

  deleteArticle(articleId: number) {
    const article = articles.filter((article) => article.id === articleId);

    if (article === undefined) {
      throw new NotFoundException();
    }

    articles = articles.filter((article) => article.id !== articleId);

    return articleId;
  }
}
