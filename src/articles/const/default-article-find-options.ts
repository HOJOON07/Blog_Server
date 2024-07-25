import { FindManyOptions } from 'typeorm';
import { ArticlesModel } from '../entities/articles.entity';
import {
  ArticlePrivateStateEnums,
  ArticlePublishStateEnums,
} from './article-state';

export const DEFAULT_ARTICLES_FIND_OPTIONS: FindManyOptions<ArticlesModel> = {
  // relations: ['author', 'thumbnails'],
  relations: { author: true, thumbnails: true },
  select: {
    author: { id: true, devName: true, email: true },
  },
};

export const ARTICLES_BY_ID_OPTIONS: FindManyOptions<ArticlesModel> = {
  relations: { author: true },
  select: {
    author: { id: true, devName: true, email: true, articles: true },
  },
};

export const PAGINATE_ARTICLES_OPTIONS: FindManyOptions<ArticlesModel> = {
  relations: { author: true, thumbnails: true },
  select: {
    author: { id: true, devName: true, position: true, location: true },
    commentCount: true,
    createdAt: true,
    description: true,
    id: true,
    likeCount: true,
    title: true,
    updatedAt: true,
  },
  where: {
    isPrivate: ArticlePrivateStateEnums.Open,
    isPublish: ArticlePublishStateEnums.Publish,
  },
};
