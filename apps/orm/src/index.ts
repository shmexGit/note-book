import * as sqlite3 from 'sqlite3';
import { open, ISqlite } from 'sqlite';
import * as fs from 'fs';

import { SqliteError } from './sqlite-error';
import { Repository } from './repository';

export class CourseORM {
  private config: ISqlite.Config;

  constructor(private filename: string) {
    this.config = {
      filename: this.filename,
      driver: sqlite3.Database
    }
  }

  public async migrations(migrate: string | string[]) {
    try {
      const existsDB = () => fs.promises
        .access(this.config.filename, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);

      if (await existsDB()) {
        await fs.promises.unlink(this.config.filename);
      }

      const db = await open(this.config);
      if (Array.isArray(migrate)) {
        for (let i = 0; i < migrate.length; i++) {
          await db.run(migrate[i]);
        }
      } else {
        await db.run(migrate);
      }

      await db.close();
    } catch(error: unknown) {
      if (typeof error !== 'string' && error['code']) {
        throw new SqliteError('Migrations error', error['code']);
      }
      throw new SqliteError('Migrations error');
    }
  }

  public getRepository<T>(Entity: { new(): T }) {
    return new Repository<T>(this.config, Entity);
  }
}

export { Repository } from './repository';
export * from './types';
export * from './sqlite-error';
