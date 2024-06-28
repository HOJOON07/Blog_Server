import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  ArticlePrivateStateEnums,
  ArticlePublishStateEnums,
} from '../const/article-state';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  contents?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ArticlePrivateStateEnums)
  @IsString()
  @IsOptional()
  isPrivate?: ArticlePrivateStateEnums;

  @IsEnum(ArticlePublishStateEnums)
  @IsString()
  @IsOptional()
  isPublish?: ArticlePublishStateEnums;
}
