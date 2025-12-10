import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.model';

export const domains = pgTable('domains', {
  id: serial('id').primaryKey(),
  domain: text('domain').notNull().unique(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
