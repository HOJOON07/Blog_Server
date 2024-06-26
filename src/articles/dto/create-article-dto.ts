import { IsBoolean, IsEnum, IsString } from 'class-validator';
import {
  ArticlePrivateStateEnums,
  ArticlePublishStateEnums,
} from '../const/article-state';
import { PickType } from '@nestjs/mapped-types';
import { ArticlesModel } from '../entities/articles.entity';

export class CreateArticleDto extends PickType(ArticlesModel, [
  'title',
  'contents',
  'description',
  'isPrivate',
  'isPublish',
]) {}
