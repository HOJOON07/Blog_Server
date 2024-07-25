import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;
  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID보다 높은 ID부터 값을 가져오기
  // @Type(() => Number) -> main.ts에서 클래스 트랜스포머옵션으로 대체 가능.
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  // 내림차순 정렬을 할 때는 id가 점점 작아지기 때문.
  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 정렬
  // createdAt =>생성된 시간의 내림차/오름차 순으로정렬
  // 허용되는 값들 중 하나를 넣을 수 있는 ISIN, 무조건 하나는 들어와야함
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'DESC';

  //몇개 가져올 지.
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  take?: number = 20;
}
