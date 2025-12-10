# Development Guide

## Getting Started

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd store
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Setup Database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE express_boilerplate;
   exit;

   # Push schema
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a New Feature

Follow this step-by-step process:

#### 1. Plan the Feature
- Define the data model
- Identify required endpoints
- Plan service methods
- Consider authentication needs

#### 2. Create Module Structure
```bash
mkdir -p src/modules/posts/{controllers,services,models,tests}
```

#### 3. Define the Model
```typescript
// src/modules/posts/models/post.model.ts
import { mysqlTable, serial, varchar, text, int, timestamp } from 'drizzle-orm/mysql-core';

export const posts = mysqlTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  userId: int('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

#### 4. Create the Service
```typescript
// src/modules/posts/services/post.service.ts
import { db } from '../../../core/database/connection';
import { posts, NewPost } from '../models/post.model';
import { eq } from 'drizzle-orm';

export class PostService {
  async findAll() {
    return await db.select().from(posts);
  }

  async findOne(id: number) {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }

  async create(data: NewPost) {
    const now = new Date();
    const postData = {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    
    const result = await db.insert(posts).values(postData);
    const insertId = result[0]?.insertId || result.lastInsertRowid;
    return this.findOne(insertId);
  }

  async update(id: number, data: Partial<NewPost>) {
    await db.update(posts).set(data).where(eq(posts.id, id));
    return this.findOne(id);
  }

  async delete(id: number) {
    await db.delete(posts).where(eq(posts.id, id));
  }
}
```

#### 5. Create the Controller
```typescript
// src/modules/posts/controllers/post.controller.ts
import { Controller } from '../../../core/decorators/controller.decorator';
import { Get, Post, Put, Delete } from '../../../core/decorators/http-methods.decorator';
import { Request, Response } from 'express';
import { PostService } from '../services/post.service';

@Controller('/posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('/')
  async findAll(req: Request, res: Response) {
    const posts = await this.postService.findAll();
    return posts;
  }

  @Get('/:id')
  async findOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const post = await this.postService.findOne(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    return post;
  }

  @Post('/')
  async create(req: Request, res: Response) {
    try {
      const post = await this.postService.create(req.body);
      return post;
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  @Put('/:id')
  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const post = await this.postService.update(id, req.body);
    return post;
  }

  @Delete('/:id')
  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await this.postService.delete(id);
    return { message: 'Post deleted successfully' };
  }
}
```

#### 6. Create the Module
```typescript
// src/modules/posts/posts.module.ts
import { Module } from '../../core/decorators/module.decorator';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';

@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class PostsModule {}
```

#### 7. Write Tests
```typescript
// src/modules/posts/tests/post.controller.spec.ts
import 'reflect-metadata';
import request from 'supertest';
import { Application } from '../../../core/application';
import { AppModule } from '../../../app.module';

describe('PostController', () => {
  let app: Application;
  let server: any;

  beforeAll(() => {
    app = new Application(AppModule);
    server = app['app'];
  });

  it('should create a post', async () => {
    const response = await request(server)
      .post('/posts')
      .send({
        title: 'Test Post',
        content: 'Test content',
        userId: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Post');
  });

  it('should get all posts', async () => {
    const response = await request(server).get('/posts');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

#### 8. Update SQLite Schema (for tests)
```typescript
// src/core/database/connection.ts
// Add to the SQLite table creation:
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    user_id INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);
```

#### 9. Import in AppModule
```typescript
// src/app.module.ts
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [UsersModule, AuthModule, PostsModule],
  // ...
})
export class AppModule {}
```

#### 10. Test and Verify
```bash
# Run tests
npm test

# Test manually
npm run dev
curl http://localhost:3000/posts
```

## Best Practices

### Code Organization
- Keep controllers thin - business logic in services
- One responsibility per service method
- Use TypeScript types everywhere
- Follow naming conventions: `*.controller.ts`, `*.service.ts`, `*.model.ts`

### Error Handling
```typescript
@Post('/')
async create(req: Request, res: Response) {
  try {
    const result = await this.service.create(req.body);
    return result;
  } catch (error: any) {
    return res.status(400).json({ 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
```

### Validation
Consider adding validation using class-validator:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;
}
```

### Database Queries
```typescript
// Good - Type-safe
const users = await db.select().from(users).where(eq(users.id, id));

// Bad - Raw SQL (avoid unless necessary)
const users = await db.execute(sql`SELECT * FROM users WHERE id = ${id}`);
```

### Testing
- Write tests for all new features
- Use unique data (timestamps) to avoid conflicts
- Test both success and error cases
- Keep tests focused and isolated

## Debugging

### Enable Debug Logging
```typescript
// src/config/local.ts
export const config = {
  // ...
  logger: {
    level: 'debug', // Change from 'info' to 'debug'
    fileLogging: false,
  },
};
```

### Common Issues

**Issue: Module not found**
```bash
# Check import paths
# Ensure file exists
# Verify tsconfig.json paths
```

**Issue: DI not working**
```typescript
// Ensure provider is registered
@Module({
  providers: [MyService], // Must be here
})

// Check constructor types
constructor(private myService: MyService) {} // Type must match
```

**Issue: Database errors**
```bash
# Check .env file
# Verify database exists
# Check connection settings
# Review DrizzleORM query syntax
```

## Performance Tips

1. **Use Connection Pooling** (already configured for MySQL)
2. **Add Indexes** to frequently queried columns
3. **Paginate Large Results**
   ```typescript
   async findAll(page: number = 1, limit: number = 10) {
     return await db.select()
       .from(posts)
       .limit(limit)
       .offset((page - 1) * limit);
   }
   ```
4. **Cache Frequently Accessed Data** (consider Redis)
5. **Use Transactions** for multi-step operations

## Deployment

### Production Build
```bash
npm run build
NODE_ENV=production npm start
```

### Environment Variables
Ensure all required variables are set in production:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `NODE_ENV=production`

### Database Migrations
```bash
# Generate migration
npm run db:generate

# Apply to production
NODE_ENV=production npm run db:push
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-posts

# Make changes and commit
git add .
git commit -m "Add posts module with CRUD operations"

# Push and create PR
git push origin feature/add-posts
```

## Resources

- [DrizzleORM Queries](https://orm.drizzle.team/docs/select)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
