import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/common/dto/base-pagination.dto';

export class PaginateCommentsDto extends PickType(BasePaginationDto, [
  'page',
  'where__id__less_than',
  'where__id__more_than',
]) {
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  //몇개 가져올 지.
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  take?: number = 10;
}
