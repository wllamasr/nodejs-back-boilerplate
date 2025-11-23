import { eq } from 'drizzle-orm';
import { db } from '../../../core/database/connection';
import { users } from '../models/user.model';

export class UserService {
  async findAll() {
    return await db.select().from(users);
  }

  async findOne(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async create(data: typeof users.$inferInsert) {
    // Explicitly set timestamps for SQLite compatibility
    const now = new Date();
    const userData = {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    const result = await db.insert(users).values(userData);

    // Handle different result structures for MySQL vs SQLite
    let insertId: number;
    if (result[0]) {
      // MySQL returns insertId in result[0]
      insertId = result[0].insertId;
    } else {
      // SQLite returns lastInsertRowid directly
      // @ts-ignore
      insertId = result.lastInsertRowid;
    }

    return this.findOne(insertId);
  }
}
