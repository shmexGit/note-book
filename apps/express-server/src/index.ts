import * as express from 'express';
import { env } from 'config';
import { CourseORM } from 'orm';
import initMigration from './migrations/init-001';

const orm = new CourseORM(env.SQLITE_FILENAME);

async function appStart() {
  await orm.migrations(initMigration);

  const app = express();

  app.listen(env.NODEJS_SERVER_PORT, () => {
    console.log(`Express listening on port ${env.NODEJS_SERVER_PORT}!`);
  });
}

appStart();