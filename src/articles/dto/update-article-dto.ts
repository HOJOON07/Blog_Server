import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article-dto';
import { IsOptional, IsString } from 'class-validator';

class PickDto extends PickType(CreateArticleDto, [
  'title',
  'contents',
  'description',
  'isPublish',
  'isPrivate',
]) {}

export class UpdateArticleDto extends PartialType(PickDto) {
  @IsString({
    each: true,
  })
  @IsOptional()
  thumbnails?: string[] = [];

  @IsOptional()
  articleImage?: string;
}
