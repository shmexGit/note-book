export const schema = {
  NODEJS_SERVER_PORT: { type: Number, default: 3000 },
  EXPRESS_SERVER_PORT: { type: Number, default: 3001 },
  FASTIFY_SERVER_PORT: { type: Number, default: 3002 },
  SQLITE_FILENAME: { type: String, default: './note-book.db' }
} as const;