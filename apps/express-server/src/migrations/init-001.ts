export default [`
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  login      TEXT NOT NULL,
  password   TEXT NOT NULL,
  firstName  TEXT,
  lastName   TEXT,
  createdAt  TEXT NOT NULL,
  updatedAt  TEXT NOT NULL
);`,
`CREATE TABLE IF NOT EXISTS notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  userId     INTEGER NOT NULL,
  content    TEXT,
  createdAt  TEXT NOT NULL,
  updatedAt  TEXT NOT NULL,
  CONSTRAINT notes_users_fk FOREIGN KEY (userId)
    REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);
`];