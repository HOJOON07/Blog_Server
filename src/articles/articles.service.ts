import { DEFAULT_ARTICLES_FIND_OPTIONS } from './const/default-article-find-options';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { PaginateWorkspaceArticleDto } from './dto/paginate-workspace-articles-dto';
import { PaginateUserPublicArticleDto } from './dto/paginate-user-public-article-dto';
import { UserModel } from 'src/users/entities/users.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticlesModel)
    private readonly articlesRepository: Repository<ArticlesModel>,
    private readonly commonService: CommonService,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,

    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ArticlesModel>(ArticlesModel)
      : this.articlesRepository;
  }

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
      {
        relations: { author: true, thumbnails: true },
        select: {
          author: {
            id: true,
            devName: true,
            position: true,
            location: true,
            image: true,
          },
          commentCount: true,
          createdAt: true,
          description: true,
          id: true,
          likeCount: true,
          title: true,
          updatedAt: true,
          articleImage: true,
        },
      },
      'articles',
    );
  }

  async paginateWorkspaceArticles(
    dto: PaginateWorkspaceArticleDto,
    userId: number,
  ) {
    return await this.commonService.paginate(
      dto,
      this.articlesRepository,
      {
        relations: { author: true },
        select: {
          id: true,
          author: { id: true },
          title: true,
          createdAt: true,
          updatedAt: true,
        },
        // ...where,
        where: {
          author: {
            id: userId,
          },
        },
      },
      'articles/workspace',
    );
  }

  async paginateUserPublicArticles(dto: PaginateUserPublicArticleDto) {
    const exists = await this.userRepository.exists({
      where: {
        devName: dto.devName,
      },
    });

    if (!exists) {
      throw new BadRequestException('유저 정보를 찾을 수 없습니다.');
    }

    return await this.commonService.paginate(
      dto,
      this.articlesRepository,
      {
        relations: {
          author: true,
          thumbnails: true,
        },
        select: {
          id: true,
          author: {
            devName: true,
          },
          title: true,
          description: true,
          createdAt: true,
          likeCount: true,
          commentCount: true,
          thumbnails: true,
          articleImage: true,
        },
        where: {
          author: {
            devName: dto.devName,
          },
        },
      },
      'articles/users',
    );
  }

  async getPublicArticleById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const article = await repository.findOne({
      // ...DEFAULT_ARTICLES_FIND_OPTIONS,
      where: {
        // 입력받은 id가 데이터베이스에 있는 id와 같은 값인지.
        id,
        isPrivate: ArticlePrivateStateEnums.Open,
        isPublish: ArticlePublishStateEnums.Publish,
      },
      // author의 대한 정보도 같이
    });

    if (!article) {
      // return false;
      throw new NotFoundException();
    }

    return article;
  }

  async getPrivateArticleById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const article = await repository.findOne({
      // ...DEFAULT_ARTICLES_FIND_OPTIONS,
      where: {
        // 입력받은 id가 데이터베이스에 있는 id와 같은 값인지.
        id,
      },
      // author의 대한 정보도 같이
    });
    if (!article) {
      // return false;
      throw new NotFoundException();
    }

    return article;
  }

  async getWorkspaceArticleById(id: number) {
    return await this.articlesRepository.findOne({
      where: {
        id,
      },
    });
  }

  async incrementCommentCount(articleId, qr: QueryRunner) {
    const articleRepository = this.getRepository(qr);

    await articleRepository.increment(
      {
        id: articleId,
      },
      'commentCount',
      1,
    );
  }

  async decrementCommentCount(articleId, qr: QueryRunner) {
    const articleRepository = this.getRepository(qr);

    await articleRepository.decrement(
      {
        id: articleId,
      },
      'commentCount',
      1,
    );
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

  async updateArticle(
    id: number,
    updateArticleDto: UpdateArticleDto,
    qr?: QueryRunner,
  ) {
    const articlesRepository = this.getRepository(qr);
    // save의 두가 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id)가 없다면 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면, (같은 id값) 존재하던 값을 업데이트한다.

    const article = await articlesRepository.findOne({
      where: {
        id: id,
      },
    });

    if (article == undefined) {
      throw new NotFoundException();
    }
    const { title, contents, description, isPrivate, isPublish, articleImage } =
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

    if (articleImage) {
      article.articleImage = articleImage;
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

  async isArticleMine(userId: number, articleId: number) {
    return this.articlesRepository.exists({
      where: {
        id: articleId,
        author: {
          id: userId,
        },
      },
      relations: { author: true },
    });
  }

  async getArticleByAuthorId(authorId: number) {
    const articles = await this.articlesRepository.find({
      where: {
        author: {
          id: authorId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      take: 3,
      select: {
        createdAt: true,
        title: true,
        description: true,
        id: true,
        thumbnails: true,
      },
    });
    return articles;
  }

  async getArticlesAuthor(id: number) {
    const articlesAuthor = await this.articlesRepository.findOne({
      where: {
        id,
      },
      relations: { author: true },
      select: {
        id: true,
        author: {
          id: true,
          devName: true,
          position: true,
          bio: true,
          followeeCount: true,
          followerCount: true,
          location: true,
          github: true,
          linkedin: true,
          instagram: true,
          socialEtc: true,
          email: true,
        },
      },
    });

    const authorId = articlesAuthor.author.id;

    const articles = await this.getArticleByAuthorId(authorId);

    if (!articlesAuthor) {
      throw new NotFoundException('아티클을 찾을 수 없습니다.');
    }
    return { author: articlesAuthor, articles };
  }
}
