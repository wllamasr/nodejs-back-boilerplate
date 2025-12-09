# Multi-Tenant Store Backend

A modular backend application built with **Bun**, **ElysiaJS**, and **DrizzleORM**, featuring a multi-tenant architecture, background jobs, and a NestJS-like decorator system.

## 🚀 Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [ElysiaJS](https://elysiajs.com)
- **Database:** PostgreSQL (via DrizzleORM)
- **Caching & Queues:** Redis, BullMQ
- **Reverse Proxy:** Traefik (with SSL)
- **Language:** TypeScript

## 🏢 Multi-Tenancy

This project implements a **subdomain-based multi-tenancy** strategy.
- **Tenants** are identified by the subdomain (e.g., `tenant1.localtest.me`).
- **Middleware** (`TenantMiddleware`) resolves the tenant from the `Host` header and attaches it to the request context.
- **Traefik** handles routing and SSL termination for dynamic subdomains.

## 🛠️ Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed
- [Docker](https://www.docker.com/) & Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) (for local SSL)

### Local Development (with Docker Compose)

This is the recommended way to run the full stack (App, DB, Redis, Traefik).

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Update .env with your credentials if needed
   ```

2. **Generate SSL Certificates**
   ```bash
   mkdir certs
   mkcert -install
   mkcert -key-file certs/localtest.me-key.pem -cert-file certs/localtest.me.pem "*.localtest.me" localtest.me
   ```

3. **Start Services**
   ```bash
   docker-compose up --build
   ```

4. **Access the App**
   - API: `https://api.localtest.me` (or any subdomain)
   - Traefik Dashboard: `http://localhost:8080`

### Local Development (Manual)

If you prefer running the app outside Docker (e.g., for faster feedback loop), you still need Postgres and Redis running.

1. **Start Dependencies**
   ```bash
   docker-compose up db redis -d
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Run the App**
   ```bash
   bun run dev
   ```
   The app will run on `http://localhost:3000`. Note that subdomain resolution might require manual `Host` header manipulation or local DNS setup if not using Traefik.

## 📝 Creating a CRUD Operation

We use a **decorator-based** approach similar to NestJS.

1. **Create a Model** (`src/modules/your-module/models/item.model.ts`)
   ```typescript
   import { pgTable, serial, text } from 'drizzle-orm/pg-core';

   export const items = pgTable('items', {
     id: serial('id').primaryKey(),
     name: text('name').notNull(),
   });
   ```

2. **Create a Service** (`src/modules/your-module/services/item.service.ts`)
   ```typescript
   import { db } from '@framework/database';
   import { items } from '../models/item.model';

   export class ItemService {
     async findAll() {
       return await db.select().from(items);
     }
   }
   ```

3. **Create a Controller** (`src/modules/your-module/controllers/item.controller.ts`)
   ```typescript
   import { Controller } from '@/core/decorators/controller.decorator';
   import { Get } from '@/core/decorators/route.decorators';
   import { ItemService } from '../services/item.service';

   @Controller('/items')
   export class ItemController {
     private itemService = new ItemService();

     @Get('/')
     findAll() {
       return this.itemService.findAll();
     }
   }
   ```

4. **Register in Module** (`src/modules/your-module/your.module.ts`)
   ```typescript
   import { Module } from '@/core/decorators/module.decorator';
   import { ItemController } from './controllers/item.controller';

   @Module({
     controllers: [ItemController],
   })
   export class YourModule {}
   ```

## 📂 Project Structure

```
src/
├── core/           # Core decorators, logger, middlewares
├── framework/      # Framework utilities (DB, Queue, Bootstrap)
├── modules/        # Feature modules (Users, Auth, Tenants)
│   ├── users/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   └── users.module.ts
├── app.module.ts   # Root module
├── index.ts        # Entry point
└── worker.ts       # Background worker entry point
```
