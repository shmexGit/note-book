export enum OrderKeyword {
  ASC = 'ASC',
  DESC = 'DESC',
};

export enum WhereOperator {
  EQ = '=',
  NE = '!=',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT LIKE',
  BETWEEN = 'BETWEEN',
  NOT_BETWEEN = 'NOT BETWEEN',
  IN = 'IN',
  NOT_IN = 'NOT IN',
};

export type OrderType = string | string[] | {
  columns: string[];
  keyword?: OrderKeyword
};
export type GroupType = string | string[];
export type LimitType = number | [number, number];

export type ColumnCondition = Record<string, {
  op: WhereOperator,
  value: boolean | string | string[] | number | number[];
}>;

export type WhereType = ColumnCondition | ColumnCondition[];

export interface ISelectParams {
  select?: string[];
  where?: WhereType;
  group?: GroupType;
  order?: OrderType;
  limit?: LimitType;
};
