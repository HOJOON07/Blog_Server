// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
// import { ArticlesModel } from './entities/articles.entity';
// import { CreateArticleDto } from './dto/create-article-dto';
// import { UpdateArticleDto } from './dto/update-article-dto';
// import { PaginateArticleDto } from './dto/paginate-article.dto';
// import {
//   ArticlePrivateStateEnums,
//   ArticlePublishStateEnums,
// } from './const/article-state';
// import { HOST, PROTOCOL } from 'src/common/const/env.const';
// import { CommonService } from 'src/common/common.service';

// @Injectable()
// export class ArticlesService {
//   constructor(
//     @InjectRepository(ArticlesModel)
//     private readonly articlesRepository: Repository<ArticlesModel>,
//     private readonly commonService: CommonService,
//   ) {}
//   async getAllArticles() {
//     return this.articlesRepository.find({
//       // author의 대한 정보도 같이
//       relations: ['author'],
//     });
//   }

//   async paginateArticles(dto: PaginateArticleDto) {
//     const alias = 'article';
//     const queryBuilder = this.articlesRepository.createQueryBuilder(alias);
//     this.commonService.applyPaginationAndFilters(
//       queryBuilder,
//       dto,
//       {},
//       //   { relations: ['author'] },
//       alias,
//     );

//     queryBuilder
//       .leftJoin(`${alias}.author`, 'author')
//       .addSelect(['author.id', 'author.devName', 'author.email']);

//     const [data, total] = await queryBuilder.getManyAndCount();

//     return {
//       data,
//       total,
//     };
//   }

//   async generateArticles(userId: number) {
//     for (let i = 0; i < 100; i++) {
//       await this.createArticle(userId, {
//         title: `임의로 생성된${i}`,
//         contents: `임의로 생성된 포스트 내용${i}`,
//         description: `임의로 생성된 포스트 설명${i}`,
//         isPrivate: ArticlePrivateStateEnums.Open,
//         isPublish: ArticlePublishStateEnums.Publish,
//       });
//     }
//   }

//   async getArticleById(id: number) {
//     const article = await this.articlesRepository.findOne({
//       where: {
//         // 입력받은 id가 데이터베이스에 있는 id와 같은 값인지.
//         author: {
//           id: id,
//         },
//       },
//       // author의 대한 정보도 같이
//       relations: ['author'],
//     });

//     if (!article) {
//       // return false;
//       throw new NotFoundException();
//     }

//     return article;
//   }

//   async createArticle(authorId: number, articleDto: CreateArticleDto) {
//     //create 메서드는 동기적으로 동작함.
//     const article = this.articlesRepository.create({
//       author: {
//         id: authorId,
//       },
//       ...articleDto,
//     });
//     // save는 만든 아티클을 저장할 수 있도록
//     const newArticle = await this.articlesRepository.save(article);

//     return article;
//   }

//   async updateArticle(id: number, updateArticleDto: UpdateArticleDto) {
//     // save의 두가 기능
//     // 1) 만약에 데이터가 존재하지 않는다면 (id)가 없다면 새로 생성한다.
//     // 2) 만약에 데이터가 존재한다면, (같은 id값) 존재하던 값을 업데이트한다.

//     const article = await this.articlesRepository.findOne({
//       where: {
//         id: id,
//       },
//     });

//     if (article == undefined) {
//       throw new NotFoundException();
//     }
//     const { title, contents, description, isPrivate, isPublish } =
//       updateArticleDto;
//     if (title) {
//       article.title = title;
//     }
//     if (contents) {
//       article.contents = contents;
//     }
//     if (description) {
//       article.description = description;
//     }
//     if (isPrivate) {
//       article.isPrivate = isPrivate;
//     }
//     if (isPublish) {
//       article.isPublish = isPublish;
//     }

//     const newArticle = await this.articlesRepository.save(article);

//     return newArticle;
//   }

//   async deleteArticle(articleId: number) {
//     const article = await this.articlesRepository.findOne({
//       where: {
//         id: articleId,
//       },
//     });

//     if (article == undefined) {
//       throw new NotFoundException();
//     }

//     await this.articlesRepository.delete(articleId);
//   }
// }
