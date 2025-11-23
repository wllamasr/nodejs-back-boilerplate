import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import { ConfigService } from '../config/config.service';

const configService = new ConfigService();
const env = configService.get<string>('env');

let db: any;
let connection: any;

if (env === 'test') {
  // Use SQLite for tests
  const sqlite = new Database(':memory:');
  db = drizzleSqlite(sqlite);

  // Create tables for tests
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  connection = sqlite;
} else {
  // Use MySQL for development/production
  const dbConfig = configService.get<any>('database');

  connection = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  db = drizzleMysql(connection);
}

export { db, connection };
