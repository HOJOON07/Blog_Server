import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticlesModel } from './entities/articles.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticlesModel)
    private readonly articlesRepository: Repository<ArticlesModel>,
  ) {}
  async getAllArticles() {
    return this.articlesRepository.find({
      // author의 대한 정보도 같이
      relations: ['author'],
    });
  }

  async getArticleById(id: number) {
    const article = await this.articlesRepository.findOne({
      where: {
        // 입력받은 id가 데이터베이스에 있는 id와 같은 값인지.
        id: id,
      },
      // author의 대한 정보도 같이
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }

  async createArticle(
    authorId: number,
    title: string,
    description: string,
    contents: string,
    isPrivate: boolean,
    isPublish: boolean,
  ) {
    //create 메서드는 동기적으로 동작함.
    const article = this.articlesRepository.create({
      author: {
        id: authorId,
      },
      title,
      contents,
      description,
      isPrivate,
      isPublish,
    });
    // save는 만든 아티클을 저장할 수 있도록
    const newArticle = await this.articlesRepository.save(article);

    return article;
  }

  async updateArticle(
    id: number,
    title: string,
    contents: string,
    description: string,
    isPrivate: boolean,
    isPublish: boolean,
  ) {
    // save의 두가 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id)가 없다면 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면, (같은 id값) 존재하던 값을 업데이트한다.

    const article = await this.articlesRepository.findOne({
      where: {
        id: id,
      },
    });

    if (article == undefined) {
      throw new NotFoundException();
    }

    if (title) {
      article.title = title;
    }

    if (contents) {
      article.contents = contents;
    }
    if (description) {
      article.description = description;
    }

    if (isPrivate) {
      article.isPrivate = isPrivate;
    }

    if (isPublish) {
      article.isPublish = isPublish;
    }

    const newArticle = await this.articlesRepository.save(article);

    return newArticle;
  }

  async deleteArticle(articleId: number) {
    const article = await this.articlesRepository.findOne({
      where: {
        id: articleId,
      },
    });

    if (article == undefined) {
      throw new NotFoundException();
    }

    await this.articlesRepository.delete(articleId);
  }
}
