import { IsOptional, IsString } from 'class-validator';

import { PickType } from '@nestjs/mapped-types';
import { ArticlesModel } from '../entities/articles.entity';

export class CreateArticleDto extends PickType(ArticlesModel, [
  'title',
  'description',
  'contents',
  'isPrivate',
  'isPublish',
]) {
  @IsString({
    each: true,
  })
  @IsOptional()
  thumbnails?: string[] = [];

  @IsOptional()
  articleImage?: string;
}
