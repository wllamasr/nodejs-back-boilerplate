# Project Memory: Express Boilerplate Architecture

## Overview

This is a modular Express.js boilerplate that mimics NestJS's architecture using TypeScript, DrizzleORM, and decorator-based patterns. The project features dependency injection, modular organization, authentication, and comprehensive testing.

## Architecture Principles

### 1. Modular Design
- **Modules** organize code into cohesive feature blocks
- Each module can have controllers, services, models, middlewares, and tests
- Modules can import other modules to access their providers
- Root module (`AppModule`) bootstraps the entire application

### 2. Decorator-Based Metadata
- Uses `reflect-metadata` to store configuration on classes
- Decorators like `@Module`, `@Controller`, `@Get` define behavior
- Metadata is read at runtime to configure the application

### 3. Dependency Injection
- Simple DI container in `Application` class
- Providers registered in modules are instantiated once (singleton)
- Constructor injection using `design:paramtypes` metadata
- Supports both class providers and factory providers

### 4. Dual Database Support
- **MySQL** for development and production
- **SQLite** for tests (in-memory, no setup required)
- Database connection auto-detects environment

## Core Components

### Application Class (`src/core/application.ts`)

The heart of the framework. Responsibilities:

1. **Initialize Express app** with middleware (CORS, cookie-parser, JSON parsing)
2. **Resolve providers** from all modules (depth-first traversal)
3. **Register middlewares** with dependency injection
4. **Register controllers** with dependency injection and route handlers
5. **Error handling** for unhandled errors

**Initialization Order:**
```
1. Express app creation
2. Global middlewares (CORS, cookie-parser, body-parser)
3. Resolve all providers from modules
4. Resolve and register custom middlewares
5. Resolve and register controllers
6. Error handler middleware
```

### Module System

**Decorator:** `@Module({ imports, controllers, providers, middlewares })`

**Metadata Keys:**
- `imports` - Other modules to import
- `MODULE_CONTROLLERS` - Controllers to register
- `providers` - Services and other injectables
- `MODULE_MIDDLEWARES` - Middlewares to apply

**Example:**
```typescript
@Module({
  imports: [UsersModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
  middlewares: [AuthMiddleware],
})
export class AuthModule {}
```

### Controller System

**Decorators:**
- `@Controller(prefix)` - Define controller with route prefix
- `@Get(path)`, `@Post(path)`, etc. - Define route handlers

**How it works:**
1. `@Controller` stores prefix in metadata
2. HTTP method decorators store route definitions
3. `Application.registerControllers()` reads metadata and registers routes
4. Controllers are instantiated with DI (constructor params resolved)

**Route Handler Wrapping:**
- Handlers are wrapped in Promise.resolve() for async support
- Results automatically sent as JSON if not already sent
- Errors caught and passed to error handler

### Dependency Injection

**Provider Types:**

1. **Class Provider:**
```typescript
providers: [UserService]
// Equivalent to: new UserService()
```

2. **Factory Provider:**
```typescript
providers: [{
  provide: AuthService,
  useFactory: (userService, config) => new AuthService(userService, config),
  inject: [UserService, ConfigService],
}]
```

**Resolution:**
- Providers stored in `Map<any, any>` (class/token → instance)
- Constructor dependencies resolved via `design:paramtypes` metadata
- Circular dependencies not supported (would cause infinite loop)

### Middleware System

**Decorator:** `@Middleware(path?)`

**Interface:**
```typescript
interface Middleware {
  use(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}
```

**Registration:**
- Middlewares resolved from all modules
- Instantiated with DI (constructor params resolved)
- Registered with Express in order of module import

### Configuration System

**Django-style TypeScript configs:**

- `src/config/types.ts` - TypeScript interfaces
- `src/config/base.ts` - Shared configuration
- `src/config/local.ts` - Local development
- `src/config/development.ts` - Development environment
- `src/config/production.ts` - Production environment
- `src/config/test.ts` - Test environment

**ConfigService:**
- Loads appropriate config based on `NODE_ENV`
- Provides type-safe `get<T>(key)` method
- Secrets loaded from `.env` file via `process.env`

### Validation System

**Decorators for input validation:**

```typescript
@Post('/')
@ValidateBody(CreateUserDto)
@Serializer(UserSerializer)
async create(req: Request, res: Response) {
  return this.userService.create(req.body);
}
```

**Available Validators:**
- `@ValidateBody(dto)` - Validates request body
- `@ValidateQuery(dto)` - Validates query parameters
- `@ValidateParams(dto)` - Validates route parameters

**DTOs with class-validator:**

```typescript
export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email!: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;
}
```

**How it works:**
1. Transforms plain object to DTO class instance
2. Validates using `class-validator` decorators
3. Returns 400 with detailed errors if invalid
4. Replaces `req.body`/`req.query`/`req.params` with validated instance

**Serialization:**
- Renamed from `@Serialize` to `@Serializer`
- Transforms response using `class-transformer`
- Excludes properties not marked with `@Expose`

### Database Layer

**Connection Strategy:**
```typescript
if (env === 'test') {
  // SQLite in-memory
  db = drizzle(new Database(':memory:'));
} else {
  // MySQL connection pool
  db = drizzle(mysql.createPool(config));
}
```

**DrizzleORM Models:**
- Defined using `mysqlTable()` from `drizzle-orm/mysql-core`
- Type inference: `typeof table.$inferSelect` and `typeof table.$inferInsert`
- Queries use chainable API: `db.select().from(table).where(eq(...))`

**SQLite Compatibility:**
- Table schemas created manually for SQLite
- Timestamps handled explicitly (SQLite doesn't have `NOW()`)
- Insert result structure differs (MySQL: `result[0].insertId`, SQLite: `result.lastInsertRowid`)

## Authentication System

### Components

1. **AuthService** - Password hashing (bcrypt), JWT generation/verification
2. **AuthController** - Register, login, logout endpoints
3. **AuthMiddleware** - Token extraction and validation
4. **Strategies** - Pluggable authentication methods

### Strategy Pattern

**Interface:**
```typescript
interface AuthStrategy {
  validate(req: Request): Promise<any | null>;
}
```

**Built-in Strategies:**
- `JwtCookieStrategy` - Validates JWT from `Authentication` cookie
- `JwtHeaderStrategy` - Validates JWT from `Authorization: Bearer` header

**AuthMiddleware:**
- Tries each strategy in order
- Sets `req.user` if any strategy succeeds
- Doesn't block request (guards would handle that)

### Token Flow

1. **Register:** Hash password → Create user → Return user data
2. **Login:** Validate credentials → Generate JWT → Set cookie + return token
3. **Request:** Extract token → Verify JWT → Set `req.user`
4. **Logout:** Clear cookie

## Testing Strategy

### Test Environment Setup

**Automatic SQLite:**
- Jest sets `NODE_ENV=test`
- Database connection detects this and uses SQLite
- In-memory database created fresh for each test run

**Test Structure:**
```typescript
describe('Controller', () => {
  let app: Application;
  let server: any;

  beforeAll(() => {
    app = new Application(AppModule);
    server = app['app']; // Access Express app
  });

  it('should...', async () => {
    const response = await request(server).get('/endpoint');
    expect(response.status).toBe(200);
  });
});
```

### Key Testing Patterns

1. **Integration Tests** - Test full request/response cycle
2. **Supertest** - HTTP assertions
3. **Unique Data** - Use timestamps to avoid conflicts
4. **No Mocking** - Real services, real database (SQLite)

## File Organization

```
src/
├── core/                          # Framework code
│   ├── application.ts             # Main app class (DI, routing)
│   ├── config/                    # Configuration service
│   ├── database/                  # DB connections
│   ├── decorators/                # All decorators
│   ├── interfaces/                # Core interfaces
│   ├── logger/                    # Winston logging
│   └── middlewares/               # Global middlewares
├── modules/                       # Feature modules
│   ├── auth/                      # Authentication
│   │   ├── auth.module.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── strategies/
│   │   └── tests/
│   └── users/                     # User management
│       ├── users.module.ts
│       ├── controllers/
│       ├── models/
│       ├── services/
│       ├── serializers/
│       └── tests/
├── config/                        # Environment configs
│   ├── types.ts
│   ├── base.ts
│   ├── local.ts
│   ├── development.ts
│   ├── production.ts
│   └── test.ts
├── app.module.ts                  # Root module
└── app.ts                         # Entry point
```

## Extension Patterns

### Adding a New Module

1. Create directory structure
2. Define model with DrizzleORM
3. Create service with business logic
4. Create controller with routes
5. Create module with `@Module` decorator
6. Import in `AppModule`

### Adding a New Middleware

1. Create class implementing `Middleware` interface
2. Add `@Middleware(path?)` decorator
3. Inject dependencies via constructor
4. Register in module's `middlewares` array

### Adding a New Auth Strategy

1. Implement `AuthStrategy` interface
2. Add to `AuthMiddleware.strategies` array
3. Strategy will be tried in order

### Adding a New Configuration

1. Update `Config` interface in `src/config/types.ts`
2. Add values to environment-specific configs
3. Access via `ConfigService.get()`

## Common Workflows

### Development Workflow

1. Start dev server: `npm run dev`
2. Make changes (auto-reload via nodemon)
3. Test changes: `npm test`
4. Commit changes

### Adding a Feature

1. Create module structure
2. Write model → service → controller → module
3. Write tests
4. Import module in `AppModule`
5. Test integration

### Database Changes

1. Modify model definition
2. Run `npm run db:generate` (creates migration)
3. Run `npm run db:push` (applies to database)
4. Update SQLite schema in `connection.ts` if needed

## Key Design Decisions

1. **Why decorators?** - Clean, declarative syntax similar to NestJS
2. **Why not full NestJS?** - Learning exercise, lighter weight
3. **Why DrizzleORM?** - Type-safe, lightweight, SQL-like
4. **Why SQLite for tests?** - Fast, no setup, isolated
5. **Why TypeScript configs?** - Type safety, complex objects, imports
6. **Why simple DI?** - Sufficient for most cases, easy to understand

## Limitations & Future Improvements

**Current Limitations:**
- No circular dependency detection
- No request-scoped providers
- No guards/interceptors (can add)
- No pipes/validation (can add class-validator)
- No WebSocket support
- No GraphQL support

**Potential Improvements:**
- Add guards for route protection
- Add interceptors for response transformation
- Add pipes for validation
- Add request-scoped DI
- Add CLI for scaffolding
- Add hot module replacement
- Add API documentation generation

## Troubleshooting Guide

### "Cannot find module" errors
- Check import paths (relative vs absolute)
- Verify file exists
- Check `tsconfig.json` paths

### DI not working
- Ensure provider is registered in module
- Check constructor parameter types
- Verify `emitDecoratorMetadata: true` in tsconfig

### Tests failing
- Check `NODE_ENV=test` is set
- Verify SQLite schema matches MySQL schema
- Check for async issues (missing await)

### Database errors
- Verify `.env` file exists
- Check database credentials
- Ensure database exists (MySQL)
- Check DrizzleORM query syntax

## References

- [Express.js Documentation](https://expressjs.com/)
- [DrizzleORM Documentation](https://orm.drizzle.team/)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Reflect Metadata](https://github.com/rbuckton/reflect-metadata)
- [NestJS Documentation](https://docs.nestjs.com/) (inspiration)
