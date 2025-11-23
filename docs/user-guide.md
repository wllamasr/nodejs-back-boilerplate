# User Guide

## Core Concepts

### Modules

Modules organize your application into cohesive blocks. Each module can have:
- **Controllers** - Handle HTTP requests
- **Services** - Business logic
- **Providers** - Injectable dependencies
- **Middlewares** - Request processing

**Example:**
```typescript
@Module({
  imports: [OtherModule],
  controllers: [UserController],
  providers: [UserService],
  middlewares: [AuthMiddleware],
})
export class UsersModule {}
```

### Controllers

Controllers handle HTTP requests using decorators:

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async findAll(req: Request, res: Response) {
    return await this.userService.findAll();
  }

  @Post('/')
  async create(req: Request, res: Response) {
    return await this.userService.create(req.body);
  }
}
```

**Available Decorators:**
- `@Get(path)` - GET requests
- `@Post(path)` - POST requests
- `@Put(path)` - PUT requests
- `@Delete(path)` - DELETE requests
- `@Patch(path)` - PATCH requests

### Services

Services contain business logic and are injectable:

```typescript
export class UserService {
  async findAll() {
    return await db.select().from(users);
  }

  async create(data: NewUser) {
    return await db.insert(users).values(data);
  }
}
```

### Dependency Injection

Services are automatically injected into controllers:

```typescript
@Controller('/posts')
export class PostController {
  // UserService is automatically injected
  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}
}
```

## Working with the Database

### Defining Models

```typescript
import { mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Querying Data

```typescript
import { db } from '../core/database/connection';
import { users } from './models/user.model';
import { eq } from 'drizzle-orm';

// Select all
const allUsers = await db.select().from(users);

// Select with condition
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1));

// Insert
await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe',
});

// Update
await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));
```

## Configuration

Configuration is managed through TypeScript files in `src/config/`:

### Environment-Specific Configs

- `local.ts` - Local development
- `development.ts` - Development environment
- `production.ts` - Production environment
- `test.ts` - Test environment

The appropriate config is loaded based on `NODE_ENV`.

### Using Configuration

```typescript
import { ConfigService } from './core/config/config.service';

export class MyService {
  constructor(private config: ConfigService) {}

  someMethod() {
    const dbConfig = this.config.get('database');
    const jwtSecret = this.config.get('secrets').jwtSecret;
  }
}
```

## Authentication

### Registering Users

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Logging In

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Returns a JWT token in the response body and sets an HttpOnly cookie.

### Using Authentication

Include the token in requests:

**Option 1: Cookie (automatic)**
The token is automatically sent after login.

**Option 2: Authorization header**
```bash
Authorization: Bearer <your-jwt-token>
```

### Protected Routes

Access the authenticated user in controllers:

```typescript
@Get('/profile')
async getProfile(req: Request, res: Response) {
  const user = (req as any).user; // Set by AuthMiddleware
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  return user;
}
```

## Middlewares

Create custom middlewares:

```typescript
import { Middleware } from '../core/decorators/middleware.decorator';
import { Middleware as IMiddleware } from '../core/interfaces/middleware.interface';

@Middleware() // Apply globally
export class LoggerMiddleware implements IMiddleware {
  constructor(private logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.path}`);
    next();
  }
}
```

Register in a module:

```typescript
@Module({
  middlewares: [LoggerMiddleware],
})
```

## Serializers

Transform data before sending responses:

```typescript
import { Expose } from 'class-transformer';

export class UserSerializer {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;
  
  // password is excluded
}
```

Use with `@Serializer`:

```typescript
@Get('/')
@Serializer(UserSerializer)
async findAll() {
  return await this.userService.findAll();
}
```

## Validation

Validate request data using DTOs and decorators:

```typescript
import { ValidateBody } from '../core/decorators/validate.decorator';
import { CreateUserDto } from '../dtos/create-user.dto';

@Post('/')
@ValidateBody(CreateUserDto)
@Serializer(UserSerializer)
async create(req: Request, res: Response) {
  // req.body is validated against CreateUserDto
  return this.userService.create(req.body);
}
```

**Creating DTOs:**

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;
}
```

**Validation Decorators:**
- `@ValidateBody(dto)` - Validate request body
- `@ValidateQuery(dto)` - Validate query parameters
- `@ValidateParams(dto)` - Validate route parameters

**Common Validators:**
- `@IsEmail()` - Valid email
- `@IsString()` - Must be string
- `@MinLength(n)` - Minimum length
- `@MaxLength(n)` - Maximum length
- `@IsNumber()` - Must be number
- `@IsOptional()` - Field is optional

See [Validation Guide](validation-guide.md) for complete documentation.

## Testing

Write tests using Jest and Supertest:

```typescript
import 'reflect-metadata';
import request from 'supertest';
import { Application } from '../core/application';
import { AppModule } from '../app.module';

describe('UserController', () => {
  let app: Application;
  let server: any;

  beforeAll(() => {
    app = new Application(AppModule);
    server = app['app'];
  });

  it('should create a user', async () => {
    const response = await request(server)
      .post('/users')
      .send({ email: 'test@example.com', name: 'Test' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});
```

Tests automatically use SQLite in-memory database.

## Logging

Use the LoggerService:

```typescript
export class MyService {
  constructor(private logger: LoggerService) {}

  someMethod() {
    this.logger.log('Info message');
    this.logger.error('Error message');
    this.logger.warn('Warning message');
    this.logger.debug('Debug message');
  }
}
```

## Best Practices

1. **Keep controllers thin** - Move logic to services
2. **Use TypeScript types** - Leverage type safety
3. **Write tests** - Tests are fast with SQLite
4. **Handle errors** - Use try-catch in controllers
5. **Validate input** - Check request data
6. **Use serializers** - Never expose sensitive data
7. **Log appropriately** - Use correct log levels

## Common Patterns

### Error Handling

```typescript
@Post('/')
async create(req: Request, res: Response) {
  try {
    const result = await this.service.create(req.body);
    return result;
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
```

### Pagination

```typescript
@Get('/')
async findAll(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const results = await this.service.findAll(page, limit);
  return results;
}
```

### Validation

```typescript
@Post('/')
async create(req: Request, res: Response) {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }
  
  return await this.service.create({ email, password, name });
}
```
