import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';
import {
  ArticlePrivateStateEnums,
  ArticlePublishStateEnums,
} from '../const/article-state';
import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class PaginateUserPublicArticleDto extends PickType(BasePaginationDto, [
  'order__createdAt',
  'page',
  'where__id__less_than',
  'where__id__more_than',
]) {
  @IsString()
  @Type(() => String)
  devName: string;

  @IsNumber()
  @IsOptional()
  where__likeCount__more_than?: number;

  @IsString()
  @IsOptional()
  where__title__i_like?: string;

  @IsString()
  @IsOptional()
  where__description__i_like?: string;

  @IsString()
  @IsOptional()
  where__isPrivate: ArticlePrivateStateEnums = ArticlePrivateStateEnums.Open;

  @IsString()
  @IsOptional()
  where__isPublish: ArticlePublishStateEnums = ArticlePublishStateEnums.Publish;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  take?: number = 8;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__likeCount: 'ASC' | 'DESC' = 'DESC';
}
