import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from '../../modules/users/models/user.model';

// Create in-memory SQLite database for tests
const sqlite = new Database(':memory:');
export const testDb = drizzle(sqlite);

// Create tables
export function setupTestDatabase() {
  // Create users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
}

// Clean up database
export function cleanupTestDatabase() {
  sqlite.exec('DELETE FROM users');
}

// Close database connection
export function closeTestDatabase() {
  sqlite.close();
}
