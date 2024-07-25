import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class PaginateWorkspaceArticleDto extends PickType(BasePaginationDto, [
  'order__createdAt',
  'page',
  'where__id__less_than',
  'where__id__more_than',
]) {
  @IsNumber()
  @IsOptional()
  where__likeCount__more_than?: number;

  @IsString()
  @IsOptional()
  where__title__i_like?: string;

  @IsString()
  @IsOptional()
  where__description__i_like?: string;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__updatedAt: 'ASC' | 'DESC' = 'ASC';

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  take?: number = 14;
}
