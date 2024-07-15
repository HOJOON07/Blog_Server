import { FindManyOptions } from 'typeorm';
import { ArticlesModel } from '../entities/articles.entity';

export const DEFAULT_ARTICLES_FIND_OPTIONS: FindManyOptions<ArticlesModel> = {
  // relations: ['author', 'thumbnails'],
  relations: { author: true, thumbnails: true },
};
