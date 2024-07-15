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

//   //1) 오름차 순으로 정렬하는 pagination만 일단 구현
//   async paginateArticles(dto: PaginateArticleDto) {
//     // const queryBuilder =
//     //   this.articlesRepository.createQueryBuilder('article');
//     // this.commonService.applyPaginationAndFilters(queryBuilder, dto, {
//     //   relations: ['author'],
//     // });

//     // queryBuilder
//     //   .leftJoinAndSelect('articles_model.author', 'author')
//     //   .addSelect(['author,id', 'author.name', 'authro.email']);

//     // const [data, total] = await queryBuilder.getManyAndCount();

//     // return {
//     //   data,
//     //   total,
//     // };

//     return this.commonService.paginate(
//       dto,
//       this.articlesRepository,
//       { relations: ['author'] },
//       'articles',
//     );
//   }

//   async pagePaginateArticles(dto: PaginateArticleDto) {
//     /**
//      * data:Data[] ->
//      * total:number -> 전체 데이터가 몇개가 되는지.
//      *
//      * [1] [2] [3] [4]
//      */
//     // const [articles, count] = await this.articlesRepository.findAndCount({
//     //   skip: dto.take * (dto.page - 1),
//     //   take: dto.take,
//     //   order: {
//     //     createdAt: dto.order__createdAt,
//     //   },
//     // });
//     // return {
//     //   data: articles,
//     //   total: count,
//     // };
//   }

//   async cursorPaginateArticles(dto: PaginateArticleDto) {
//     // const where: FindOptionsWhere<ArticlesModel> = {};
//     // if (dto.where__id__less_than) {
//     //   where.id = LessThan(dto.where__id__less_than);
//     // } else if (dto.where__id__more_than) {
//     //   where.id = MoreThan(dto.where__id__more_than);
//     // }
//     // // 1,2,3,4,5,
//     // const articles = await this.articlesRepository.find({
//     //   where,
//     //   // 날짜 기준 오름차순 정렬중
//     //   order: {
//     //     createdAt: dto.order__createdAt,
//     //   },
//     //   take: dto.take,
//     // });
//     // // 해당되는 포스트가 0개이상이면 마지막 포스트를 가져오고
//     // // 아니면 null을 반환한다.
//     // const lastItem =
//     //   articles.length > 0 && articles.length === dto.take
//     //     ? articles[articles.length - 1]
//     //     : null;
//     // const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/articles`);
//     // // dto의 키 값들을 돌면서 키값에 해당하는 밸류가 존재하면 param에 그대로 붙여넣는다.
//     // // 단 where__id_more_than값만 lastItem의 마지막 값으로 넣어준다.
//     // if (nextUrl) {
//     //   for (const key of Object.keys(dto)) {
//     //     if (dto[key]) {
//     //       if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
//     //         nextUrl.searchParams.append(key, dto[key]);
//     //       }
//     //     }
//     //   }
//     // }
//     // let key = null;
//     // if (dto.order__createdAt === 'ASC') {
//     //   key = 'where__id__more_than';
//     // } else {
//     //   key = 'where__id__less_than';
//     // }
//     // nextUrl.searchParams.append(key, lastItem.id.toString());
//     // /**
//     //  * Response
//     //  * data:Data[]
//     //  * cursor:{
//     //  *  after:마지막 데이터의 ID
//     //  * },
//     //  * count:응답한 데이터의 갯수
//     //  * next:다음 요청을 할때 사용할 URL
//     //  * @
//     //  */
//     // return {
//     //   data: articles,
//     //   cursor: {
//     //     after: lastItem?.id ?? null,
//     //   },
//     //   count: articles.length,
//     //   next: nextUrl?.toString() ?? null,
//     // };
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
