import { DEFAULT_ARTICLES_FIND_OPTIONS } from './const/default-article-find-options';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ArticlesModel } from './entities/articles.entity';
import { CreateArticleDto } from './dto/create-article-dto';
import { UpdateArticleDto } from './dto/update-article-dto';
import { PaginateArticleDto } from './dto/paginate-article.dto';
import {
  ArticlePrivateStateEnums,
  ArticlePublishStateEnums,
} from './const/article-state';

import { CommonService } from 'src/common/common.service';

import { ImageModel } from 'src/common/entities/image.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticlesModel)
    private readonly articlesRepository: Repository<ArticlesModel>,
    private readonly commonService: CommonService,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}
  async getAllArticles() {
    return this.articlesRepository.find({
      // author의 대한 정보도 같이
      ...DEFAULT_ARTICLES_FIND_OPTIONS,
    });
  }

  async paginateArticles(dto: PaginateArticleDto) {
    return this.commonService.paginate(
      dto,
      this.articlesRepository,
      { ...DEFAULT_ARTICLES_FIND_OPTIONS },
      'articles',
    );
  }

  async generateArticles(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createArticle(userId, {
        title: `임의로 생성된${i}`,
        contents: `임의로 생성된 포스트 내용${i}`,
        description: `임의로 생성된 포스트 설명${i}`,
        isPrivate: ArticlePrivateStateEnums.Open,
        isPublish: ArticlePublishStateEnums.Publish,
        thumbnails: [],
      });
    }
  }

  async getArticleById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const article = await repository.findOne({
      ...DEFAULT_ARTICLES_FIND_OPTIONS,
      where: {
        // 입력받은 id가 데이터베이스에 있는 id와 같은 값인지.
        id,
      },
      // author의 대한 정보도 같이
    });

    if (!article) {
      console.log('여기구나?');
      // return false;
      throw new NotFoundException();
    }

    return article;
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ArticlesModel>(ArticlesModel)
      : this.articlesRepository;
  }

  async createArticle(
    authorId: number,
    articleDto: CreateArticleDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);
    //create 메서드는 동기적으로 동작함.
    const article = repository.create({
      author: {
        id: authorId,
      },
      ...articleDto,
      thumbnails: [],
    });
    // save는 만든 아티클을 저장할 수 있도록
    const newArticle = await repository.save(article);

    return article;
  }

  async updateArticle(id: number, updateArticleDto: UpdateArticleDto) {
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
    const { title, contents, description, isPrivate, isPublish } =
      updateArticleDto;
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

  async checkArticleExistById(id: number) {
    return this.articlesRepository.exists({
      where: {
        id,
      },
    });
  }
}
