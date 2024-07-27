// import { BadRequestException, Injectable } from '@nestjs/common';
// import { BasePaginationDto } from './dto/base-pagination.dto';
// import {
//   FindManyOptions,
//   FindOptionsOrder,
//   FindOptionsWhere,
//   Repository,
// } from 'typeorm';
// import { BaseModel } from './entities/base.entity';
// import { FILTER_MAPPER } from './const/filter-mapper.const';
// import { over } from 'lodash';
// import { ConfigService } from '@nestjs/config';
// import { ENV_HOST, ENV_PROTOCOL } from './const/env-keys.const';

// @Injectable()
// export class CommonService {
//   constructor(private readonly configService: ConfigService) {}
//   paginate<T extends BaseModel>(
//     dto: BasePaginationDto,
//     repository: Repository<T>,
//     overrideFindOptions: FindManyOptions<T> = {},
//     path: string,
//     alias: string = 'entity',
//   ) {
//     if (dto.page) {
//       return this.pagePaginate(dto, repository, overrideFindOptions, alias);
//     } else {
//       return this.cursorPaginate(
//         dto,
//         repository,
//         overrideFindOptions,
//         path,
//         alias,
//       );
//     }
//   }

//   private async pagePaginate<T extends BaseModel>(
//     dto: BasePaginationDto,
//     repository: Repository<T>,
//     overrideFindOptions: FindManyOptions<T> = {},
//     alias: string,
//   ) {
//     const queryBuilder = repository.createQueryBuilder(alias);

//     this.applyPaginationAndFilters(
//       queryBuilder,
//       dto,
//       overrideFindOptions,
//       alias,
//     );

//     const [data, count] = await queryBuilder.getManyAndCount();

//     return {
//       data,
//       total: count,
//     };
//   }

//   private async cursorPaginate<T extends BaseModel>(
//     dto: BasePaginationDto,
//     repository: Repository<T>,
//     overrideFindOptions: FindManyOptions<T> = {},
//     path: string,
//     alias: string,
//   ) {
//     const queryBuilder = repository.createQueryBuilder(alias);

//     this.applyPaginationAndFilters(
//       queryBuilder,
//       dto,
//       overrideFindOptions,
//       alias,
//     );

//     const results = await queryBuilder.getMany();

//     const lastItem =
//       results.length > 0 && results.length === dto.take
//         ? results[results.length - 1]
//         : null;

//     const protocol = this.configService.get<string>(ENV_PROTOCOL);
//     const host = this.configService.get<string>(ENV_HOST);

//     let nextUrl = null;
//     if (lastItem) {
//       const protocol = this.configService.get<string>(ENV_PROTOCOL);
//       const host = this.configService.get<string>(ENV_HOST);

//       nextUrl = new URL(`${protocol}://${host}/${path}`);

//       for (const key of Object.keys(dto)) {
//         if (dto[key]) {
//           if (
//             key !== 'where__id__more_than' &&
//             key !== 'where__id__less_than'
//           ) {
//             nextUrl.searchParams.append(key, dto[key]);
//           }
//         }
//       }
//       let key = null;
//       if (dto.order__createdAt === 'ASC') {
//         key = 'where__id__more_than';
//       } else {
//         key = 'where__id__less_than';
//       }

//       nextUrl.searchParams.append(key, lastItem.id.toString());
//     }

//     // const count = await queryBuilder.getCount()

//     return {
//       data: results,
//       cursor: {
//         after: lastItem?.id ?? null,
//       },
//       count: results.length,
//       next: nextUrl?.toString() ?? null,
//     };
//   }

//   applyPaginationAndFilters<T extends BaseModel>(
//     queryBuilder: any,
//     dto: BasePaginationDto,
//     overrideFindOptions: any,
//     alias: string,
//   ) {
//     const { where, order, take, skip } = this.composeFindOptions<T>(dto);

//     queryBuilder.where(where);
//     queryBuilder.orderBy(order);
//     queryBuilder.take(take ?? undefined);
//     queryBuilder.skip(skip ?? undefined);

//     if (overrideFindOptions.relations) {
//       overrideFindOptions.relations.forEach((relation) => {
//         queryBuilder.leftJoinAndSelect(
//           `${alias}.${relation}`,
//           `${relation}_alias`,
//         );
//       });
//     }
//   }

//   private composeFindOptions<T extends BaseModel>(
//     dto: BasePaginationDto,
//   ): FindManyOptions<T> {
//     let where: FindOptionsWhere<T> = {};
//     let order: FindOptionsOrder<T> = {};

//     for (const [key, value] of Object.entries(dto)) {
//       // key -> where__id__less_than
//       // value -> 1

//       if (key.startsWith('where__')) {
//         where = {
//           ...where,
//           ...this.parseWhereFilter(key, value),
//         };
//       } else if (key.startsWith('order__')) {
//         order = {
//           ...order,
//           ...this.parseWhereFilter(key, value),
//         };
//       }
//     }

//     return {
//       where,
//       order,
//       take: dto.take,
//       skip: dto.page ? dto.take * (dto.page - 1) : null,
//     };
//   }

//   private parseWhereFilter<T extends BaseModel>(
//     key: string,
//     value: any,
//   ): FindOptionsWhere<T> | FindOptionsOrder<T> {
//     const options: FindOptionsWhere<T> = {};

//     const split = key.split('__');

//     if (split.length !== 2 && split.length !== 3) {
//       throw new BadRequestException(
//         `where 필터는 '__'로 split 했을 때 길이가 2또는 3이어야 합니다. -문제되는 키값 ${key}`,
//       );
//     }

//     if (split.length === 2) {
//       const [_, field] = split;
//       options[field] = value;
//     } else {
//       const [_, field, operator] = split;

//       // const values = value.toString().split(',');
//       if (operator === 'i_like') {
//         options[field] = FILTER_MAPPER[operator](`%${value}%`);
//       } else {
//         options[field] = FILTER_MAPPER[operator](value);
//       }
//     }
//     return options;
//   }

//   private parseOrderFilter<T extends BaseModel>(
//     key: string,
//     value: any,
//   ): FindOptionsOrder<T> {
//     const order: FindOptionsOrder<T> = {};

//     /**
//      * order는 무조건 두개로
//      */

//     const split = key.split('__');

//     if (split.length !== 2) {
//       throw new BadRequestException(
//         `order 필터는 '__'로 split 했을 때 길이가 2여야 합니다. - 문제되는 key${key}`,
//       );
//     }

//     const [_, field] = split;
//     order[field] = value;

//     return order;
//   }
// }