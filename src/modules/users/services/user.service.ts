import { eq } from 'drizzle-orm';
import { db } from '../../../../framework/database';
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
    const now = new Date();
    const userData = {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async update(id: number, data: Partial<typeof users.$inferInsert>) {
    const now = new Date();
    const userData = {
      ...data,
      updatedAt: now,
    };

    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async delete(id: number) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0];
  }
}

