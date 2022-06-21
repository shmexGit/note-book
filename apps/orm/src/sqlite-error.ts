export enum OrmErrorCode {
  SQLITE_ORM_ERROR = 'SQLITE_ORM_ERROR',
  SQLITE_ORM_WHERE_ERROR = 'SQLITE_ORM_WHERE_ERROR',
}

export class SqliteError extends Error {
  public code: string;
  constructor(message: string, code: string = OrmErrorCode.SQLITE_ORM_ERROR) {
    super(message);
    this.code = code;
  }
}