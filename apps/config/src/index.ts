import { EnvType, load } from 'ts-dotenv';
import { resolve } from 'path';

import { schema } from './schema';

export type Env = EnvType<typeof schema>;

export const env = load(
  schema,  
  resolve(__dirname, '..', '..', '..', '..', '.env')
);