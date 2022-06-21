import { open, ISqlite } from 'sqlite';
import * as pluralize from 'pluralize';

import { 
  ISelectParams,
  WhereType,
  OrderType,
  GroupType,
  LimitType,
  ColumnCondition,
  WhereOperator,
} from './types';
import { SqliteError, OrmErrorCode } from './sqlite-error';

export class Repository<T> {
  private nameTable: string;

  constructor(private config: ISqlite.Config, Entity: new () => T) {
    this.nameTable = pluralize(new Entity().constructor.name.toLocaleLowerCase())
  }

  public async insert(data: T) {
    const columns = Object.keys(data);
    const columnKeys = columns.map((key) => `:${key}`);
    const values = columns.reduce<Record<string, unknown>>(
      (acc, value) => {
        acc[`:${value}`] = data[value];
        return acc;
      },
      {}
    );
    const sql = `
      INSERT INTO ${this.nameTable} (${columns.join(', ')}) VALUES
      (${columnKeys})
    `;

    await this.sqliteExec<ISqlite.RunResult>('insert', 'run', sql, values);
  }

  public async update(data: T, where?: WhereType) {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      throw new SqliteError('Update error');
    }

    let sql = `
      UPDATE ${this.nameTable} SET ${keys.map((key) => {
        return `${key} = ${typeof data[key] === 'string' ? 
          `'${data[key]}'` : data[key]}`;
      }).join(', ')}
    `;

    if (where) {
      sql = `${sql} WHERE ${this.parseWhereInString(where)}`;
    }
  
    await this.sqliteExec<ISqlite.RunResult>('update', 'run', sql);
  }

  public async remove(where?: WhereType) {
    let sql = `
      DELETE FROM ${this.nameTable}
    `;

    if (where) {
      sql = `${sql} WHERE ${this.parseWhereInString(where)}`;
    }

    await this.sqliteExec<ISqlite.RunResult>('remove', 'run', sql);
  }

  public async find(params?: ISelectParams) {
    const select = Boolean(params?.select) ? params.select.join(', ') : '*';
    const where = Boolean(params?.where) ?
      ` WHERE ${this.parseWhereInString(params.where)}` : '';
    const group = Boolean(params?.group) ?
      ` GROUP BY ${this.parseGroupInString(params.group)}` : '';
    const order = Boolean(params?.order) ?
      ` ORDER BY ${this.parseOrderInString(params.order)}` : '';
    const limit = Boolean(params?.limit) ?
      ` LIMIT ${this.parseLimitInString(params.limit)}` : '';
    const sql = `SELECT ${select} FROM ${this.nameTable}${where}${group}${order}${limit}`;
    return await this.sqliteExec<T[]>('find', 'all', sql);
  }

  public async findOne(id: number, select?: string[]) {
    const selectString = Boolean(select) ? select.join(', ') : '*';
    const sql = `SELECT ${selectString} FROM ${this.nameTable} WHERE id = ${id}`;
    return await this.sqliteExec<T[]>('findOne', 'get', sql);
  }

  private parseConditionInString(condition: ColumnCondition) {
    return Object.keys(condition).map((key) => {
      switch (true) {
        case (WhereOperator.GT === condition[key].op): {}
        case (WhereOperator.GTE === condition[key].op): {}
        case (WhereOperator.LT === condition[key].op): {}
        case (WhereOperator.LTE === condition[key].op): {
          if (typeof condition[key].value !== 'number') {
            throw new SqliteError(
              'Type value must be a number (GT|GTE|LT|LTE)',
              OrmErrorCode.SQLITE_ORM_WHERE_ERROR
            );
          }
          return `${key} ${condition[key].op} ${condition[key].value}`;
        }
        case (WhereOperator.NOT_BETWEEN === condition[key].op): {}
        case (WhereOperator.BETWEEN === condition[key].op): {
          if (!Array.isArray(condition[key].value)) {
            throw new SqliteError(
              'Type value must be a array (BETWEEN|NOT_BETWEEN)',
              OrmErrorCode.SQLITE_ORM_WHERE_ERROR
            );
          }

          const values = condition[key].value as number[] | string[];
          if (typeof values[0] !== 'number' && values.length < 2) {
            throw new SqliteError(
              'Types array value must be a number and array size >= 2 (BETWEEN|NOT_BETWEEN)',
              OrmErrorCode.SQLITE_ORM_WHERE_ERROR
            );
          }

          return `${key} ${condition[key].op} ${values[0]} AND ${values[1]}`;
        }
        case (WhereOperator.NOT_IN === condition[key].op): {}
        case (WhereOperator.IN === condition[key].op): {
          if (!Array.isArray(condition[key].value)) {
            throw new SqliteError(
              'Type value must be a array (NOT_IN|IN)',
              OrmErrorCode.SQLITE_ORM_WHERE_ERROR
            );
          }

          const values = condition[key].value as number[] | string[];
          if (values.length === 0) {
            throw new SqliteError('Array size > 0 (NOT_IN|IN)', OrmErrorCode.SQLITE_ORM_WHERE_ERROR);
          }
  
          return `${key} ${condition[key].op} (${values.map((value: string | number) => {
            if (typeof value === 'string') {
              return `'${value}'`;
            }
            return value;
          }).join(', ')})`;
        }
        default: {
          if (
            (WhereOperator.LIKE === condition[key].op ||
            WhereOperator.NOT_LIKE === condition[key].op) &&
            typeof condition[key].value !== 'string'
          ) {
            throw new SqliteError(
              'Type value must be a string (LIKE|NOT_LIKE)',
              OrmErrorCode.SQLITE_ORM_WHERE_ERROR
            );
          }
          const value = typeof condition[key].value === 'string' ?
            `'${condition[key].value}'` : condition[key].value;
          return `${key} ${condition[key].op} ${value}`;
        }
      }
    }).join(' AND ');
  };

  private parseWhereInString(where: WhereType) {
    if (Array.isArray(where)) {
      return where.map((condition) => {
        return `(${this.parseConditionInString(condition)}`;
      }).join(') OR ') + ')';
    }

    return this.parseConditionInString(where);
  }

  private parseLimitInString(limit: LimitType) {
    if (Array.isArray(limit)) {
      return limit.join(', ');
    }
    return limit;
  }

  private parseOrderInString(order: OrderType) {
    if (typeof order === 'string') {
      return order;
    }
    if (Array.isArray(order)) {
      return order.join(', ');
    }
    return `${order.columns.join(', ')} ${Boolean(order?.keyword) && order.keyword}`;
  }

  private parseGroupInString(group: GroupType) {
    if (Array.isArray(group)) {
      return group.join(', ');
    }
    return group;
  }

  private async sqliteExec<K>(
    nameMethod: string,
    operation: string,
    sql: string,
    values?: Record<string, unknown>
  ) {
    try {
      let result: K;
      const db = await open(this.config);

      if (values) {
        result = await db[operation](sql, values);
      } else {
        result = await db[operation](sql);
      }

      await db.close();
      return result;
    } catch(error: unknown) {
      if (typeof error !== 'string' && error['code']) {
        throw new SqliteError(`${nameMethod} error`, error['code']);
      }
      throw new SqliteError(`${nameMethod} error`);
    }
  }
}
