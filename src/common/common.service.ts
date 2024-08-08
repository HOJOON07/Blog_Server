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
import { mergeWith } from 'lodash';
import { PaginateArticleDto } from 'src/articles/dto/paginate-article.dto';

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

  private transformWhereToArray<T>(where: any): FindOptionsWhere<T>[] {
    if (!where) return [];

    const { title, description, ...rest } = where;
    const conditions = [];

    if (!title && !description) {
      return where;
    }

    if (title) {
      conditions.push({
        title,
        ...rest,
      });
    }

    if (description) {
      conditions.push({
        description,
        ...rest,
      });
    }

    return conditions;
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const mergeWithFindOptions = mergeWith(
      {},
      findOptions,
      overrideFindOptions,
      (objValue, srcValue, key, object, source, stack) => {
        if (key === 'where') {
          return { ...objValue, ...srcValue };
        }
      },
    );

    mergeWithFindOptions.where = this.transformWhereToArray(
      mergeWithFindOptions.where,
    );

    // const [data, count] = await repository.findAndCount({
    //   ...findOptions,
    //   ...overrideFindOptions,
    // });
    const [data, count] = await repository.findAndCount({
      ...mergeWithFindOptions,
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
    /** 덮어 쓰기 위한다면 이 코드를.
     *const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    })
    */
    const findOptions = this.composeFindOptions<T>(dto);
    const mergeWithFindOptions = mergeWith(
      {},
      findOptions,
      overrideFindOptions,
      (objValue, srcValue, key, object, source, stack) => {
        if (key === 'where') {
          return { ...objValue, ...srcValue };
        }
      },
    );
    mergeWithFindOptions.where = this.transformWhereToArray(
      mergeWithFindOptions.where,
    );

    const results = await repository.find({
      ...mergeWithFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/${path}`);

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
      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
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

    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을 때 길이가 2또는 3이어야 합니다. -문제되는 키값 ${key}`,
      );
    }

    if (split.length === 2) {
      const [_, field] = split;
      options[field] = value;
    } else {
      const [_, field, operator] = split;

      // const values = value.toString().split(',');
      if (operator === 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
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
