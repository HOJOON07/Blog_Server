import {
  Any,
  ArrayContainedBy,
  ArrayContains,
  ArrayOverlap,
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
export const FILTER_MAPPER = {
  not: Not,
  less_than: LessThan,
  less_than_or_equal: LessThanOrEqual,
  more_than: MoreThan,
  more_than_or_equal: MoreThanOrEqual,
  equal: Equal,
  like: Like,
  i_like: ILike,
  between: Between,
  in: In,
  any: Any,
  is_null: IsNull,
  array_contains: ArrayContains,
  array_contained_by: ArrayContainedBy,
  array_overlap: ArrayOverlap,
};

// Not: 주어진 값과 같지 않은 레코드를 필터링합니다.

// 사용 예: Not('value')는 값이 'value'가 아닌 레코드를 찾습니다.
// LessThan: 주어진 값보다 작은 레코드를 필터링합니다.

// 사용 예: LessThan(10)는 값이 10보다 작은 레코드를 찾습니다.
// LessThanOrEqual: 주어진 값보다 작거나 같은 레코드를 필터링합니다.

// 사용 예: LessThanOrEqual(10)는 값이 10보다 작거나 같은 레코드를 찾습니다.
// MoreThan: 주어진 값보다 큰 레코드를 필터링합니다.

// 사용 예: MoreThan(10)는 값이 10보다 큰 레코드를 찾습니다.
// MoreThanOrEqual: 주어진 값보다 크거나 같은 레코드를 필터링합니다.

// 사용 예: MoreThanOrEqual(10)는 값이 10보다 크거나 같은 레코드를 찾습니다.
// Equal: 주어진 값과 같은 레코드를 필터링합니다.

// 사용 예: Equal('value')는 값이 'value'인 레코드를 찾습니다.
// Like: 주어진 패턴과 일치하는 레코드를 필터링합니다. SQL의 LIKE 연산자와 유사합니다.

// 사용 예: Like('%value%')는 값이 'value'를 포함하는 레코드를 찾습니다.
// ILike: 주어진 패턴과 대소문자를 구분하지 않고 일치하는 레코드를 필터링합니다. SQL의 ILIKE 연산자와 유사합니다.

// 사용 예: ILike('%value%')는 값이 'value'를 포함하는 레코드를 대소문자 구분 없이 찾습니다.
// Between: 두 값 사이에 있는 레코드를 필터링합니다.

// 사용 예: Between(1, 10)는 값이 1과 10 사이에 있는 레코드를 찾습니다.
// In: 주어진 배열 내의 값과 일치하는 레코드를 필터링합니다.

// 사용 예: In([1, 2, 3])는 값이 1, 2, 3 중 하나인 레코드를 찾습니다.
// Any: 주어진 배열 내의 하나 이상의 값과 일치하는 레코드를 필터링합니다.

// 사용 예: Any([1, 2, 3])는 값이 1, 2, 3 중 하나와 일치하는 레코드를 찾습니다.
// IsNull: 값이 NULL인 레코드를 필터링합니다.

// 사용 예: IsNull()은 값이 NULL인 레코드를 찾습니다.
// ArrayContains: 주어진 배열이 필드 배열의 부분집합인 레코드를 필터링합니다.

// 사용 예: ArrayContains([1, 2])는 배열 필드가 [1, 2]를 포함하는 레코드를 찾습니다.
// ArrayContainedBy: 필드 배열이 주어진 배열의 부분집합인 레코드를 필터링합니다.

// 사용 예: ArrayContainedBy([1, 2, 3])는 배열 필드가 [1, 2, 3]의 부분집합인 레코드를 찾습니다.
// ArrayOverlap: 필드 배열이 주어진 배열과 겹치는 레코드를 필터링합니다.

// 사용 예: ArrayOverlap([1, 2])는 배열 필드가 [1, 2]와 겹치는 레코드를 찾습니다.
