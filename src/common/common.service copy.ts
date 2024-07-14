import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entities/base.entity';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { HOST, PROTOCOL } from './const/env.const';

@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindeOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    /**
     * where__likeCount__more_than
     *
     * where__title__ilike
     */

    const findOptions = this.composeFindeOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/${path}`);

    // dto의 키 값들을 돌면서 키값에 해당하는 밸류가 존재하면 param에 그대로 붙여넣는다.
    // 단 where__id_more_than값만 lastItem의 마지막 값으로 넣어준다.

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
    }
    let key = null;

    if (dto.order__createdAt === 'ASC') {
      key = 'where__id__more_than';
    } else {
      key = 'where__id__less_than';
    }

    nextUrl.searchParams.append(key, lastItem.id.toString());

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindeOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     *
     * where,
     * order,
     * take,
     * skip -> pagination 기반일 때만 not cursor
     */
    /**
     * DTO의 구조
     * {
     *  where__id__more_than:1,
     *  order__createdAt:"ASC"
     * }
     *
     * 현재는 where__id__more_than / where__id__less_than에 해당되는 where 필터만 사용중이지만
     * 나중에 where__likeCount__more_than 이나 where__title__ilike 등 추가 필터를 넣고 싶어졌을 때
     * 모든 where 필터들을 자동으로 파싱할 수 있을만한 기능을 제작해야한다.
     *
     * 1. where로 시작하면 필터로직
     * 2. order로 시작한다면 정렬로지
     * 3. 필터 로직을 적용한다면 '__' 기준으로 split했을 때 3개의 값으로 나뉘는지
     *    2개의 값으로 나뉘는지 확인한다.
     *    3-1 3개의 값으로 나뉜다면 FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다.
     *         where__id__more_than
     *    ex) ["where","id","more_than"]
     *
     *    3-2 2개의 값으로 나뉜다면 정확한 값을 필터하는 것이기 때문에 operator 없이 적용한다.
     *        where__id
     *    ex) ["where","id"]
     *
     *    4) order의 경우 3-2와 같이 적용한다.
     */

    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // key -> where__id__less_than
      // value -> 1

      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};

    /**
     * 예를 들어 where__id__more_than
     * __를 기준으로 나눴을 때
     * [where,id,more_than]
     *
     *
     */
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을 때 길이가 2또는 3이어야 합니다. -문제되는 키값 ${key}`,
      );
    }

    /**
     * 길이가 2일 경우는
     * where__id=3
     * ->
     * {
     *  where:{
     *   id:3
     *  }
     * }
     */

    if (split.length === 2) {
      const [_, field] = split;
      options[field] = value;
    } else {
      /**
       * 길이가 3일 경우에는 TypeORM유틸리티 적용이 필요한 경우다.
       * where__id__more_than의 경우
       * 세번째 값은 typeorm 유틸리티가 된다.
       *
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER)MAPPER에서 해당되는 utility를 가져온 후 값에 적용한다.
       */

      // where ,id ,more_than
      const [_, field, operator] = split;

      // where__id__between = 3,4
      // 만약에 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      const values = value.toString().split(',');

      // -> field -> id
      // operator -> more_than
      // FILTER_MAPPER[operator] = > MoreThan
      // between 과 같이 여러개 의 값을 넣고 싶은 경우
      // if (operator === 'between') {
      //   options[field] = FILTER_MAPPER[operator](value[0], value[1]);
      // } else {
      //   options[field] = FILTER_MAPPER[operator];
      // }
      options[field] = FILTER_MAPPER[operator](value);
    }
    return options;
  }

  private parseOrderFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsOrder<T> {
    const order: FindOptionsOrder<T> = {};

    /**
     * order는 무조건 두개로
     */

    const split = key.split('__');

    if (split.length !== 2) {
      throw new BadRequestException(
        `order 필터는 '__'로 split 했을 때 길이가 2여야 합니다. - 문제되는 key${key}`,
      );
    }

    const [_, field] = split;
    order[field] = value;

    return order;
  }
}
