# Design Decisions

This document explains the key architectural and technical decisions made in this project.

## Why NestJS-like Architecture?

**Decision:** Mimic NestJS's modular, decorator-based architecture in Express.js

**Rationale:**
- **Familiarity** - Many developers know NestJS patterns
- **Organization** - Modules provide clear code organization
- **Scalability** - Easy to add new features without coupling
- **Type Safety** - TypeScript decorators with metadata

**Trade-offs:**
- More complex than vanilla Express
- Requires understanding of decorators and metadata
- Slightly more boilerplate code

**Alternatives Considered:**
- Vanilla Express (too unstructured for large apps)
- Full NestJS (too heavy, wanted learning exercise)
- Other frameworks (Fastify, Koa) - chose Express for ecosystem

## Why Decorators?

**Decision:** Use TypeScript decorators for routing, modules, and middleware

**Rationale:**
- **Declarative** - Clear intent at a glance
- **Metadata** - Store configuration on classes
- **Clean Syntax** - Less boilerplate than manual registration
- **Familiar** - Similar to NestJS, Angular, Spring Boot

**Example:**
```typescript
@Controller('/users')
export class UserController {
  @Get('/')
  async findAll() { }
}
```

vs manual registration:
```typescript
app.get('/users', (req, res) => { });
```

**Trade-offs:**
- Requires `reflect-metadata` polyfill
- Experimental TypeScript feature
- Can be harder to debug

## Why Simple Dependency Injection?

**Decision:** Implement a basic DI container instead of using a library

**Rationale:**
- **Learning** - Understand how DI works
- **Control** - Full control over implementation
- **Lightweight** - No external DI library needed
- **Sufficient** - Handles most use cases

**How it works:**
1. Providers registered in modules
2. Constructor parameters read via `design:paramtypes` metadata
3. Dependencies resolved recursively
4. Singletons stored in Map

**Limitations:**
- No circular dependency detection
- No request-scoped providers
- No advanced features (factories are basic)

**Alternatives Considered:**
- InversifyJS (too complex for our needs)
- TypeDI (adds another dependency)
- Manual instantiation (too much boilerplate)

## Why DrizzleORM?

**Decision:** Use DrizzleORM instead of TypeORM, Prisma, or raw SQL

**Rationale:**
- **Type Safety** - Full TypeScript inference
- **Lightweight** - Smaller than TypeORM/Prisma
- **SQL-like** - Familiar syntax for SQL developers
- **Performance** - Minimal overhead
- **Flexibility** - Can drop to raw SQL when needed

**Example:**
```typescript
const users = await db.select()
  .from(users)
  .where(eq(users.id, 1));
```

**Trade-offs:**
- Smaller ecosystem than Prisma/TypeORM
- Less documentation
- Fewer built-in features

**Alternatives Considered:**
- **Prisma** - Great DX but heavy, generates client
- **TypeORM** - Feature-rich but complex, active record pattern
- **Knex** - Good but less type-safe
- **Raw SQL** - Maximum control but no type safety

## Why SQLite for Tests?

**Decision:** Use in-memory SQLite for tests, MySQL for production

**Rationale:**
- **Speed** - In-memory is extremely fast
- **Isolation** - Each test run starts fresh
- **No Setup** - No database server required
- **CI/CD Friendly** - Works anywhere Node.js runs

**Implementation:**
```typescript
if (env === 'test') {
  db = drizzle(new Database(':memory:'));
} else {
  db = drizzle(mysql.createPool(config));
}
```

**Trade-offs:**
- Schema must be maintained in two places
- SQLite has some SQL differences from MySQL
- Need to handle different result structures

**Alternatives Considered:**
- **Mock Database** - Too much mocking, not real integration tests
- **Test MySQL Instance** - Slow, requires setup
- **Docker MySQL** - Better but still slower than SQLite

## Why TypeScript Configuration Files?

**Decision:** Use TypeScript files for config instead of JSON/YAML

**Rationale:**
- **Type Safety** - Config is type-checked
- **Imports** - Can import shared values
- **Logic** - Can use conditionals, functions
- **Environment** - Easy to override per environment

**Example:**
```typescript
export const config: Config = {
  ...baseConfig,
  database: {
    host: process.env.DB_HOST || 'localhost',
  },
};
```

**Trade-offs:**
- Must be compiled (can't read directly)
- Slightly more complex than JSON

**Alternatives Considered:**
- **dotenv only** - Not structured, no types
- **JSON files** - No logic, no imports
- **YAML files** - No type safety

## Why JWT for Authentication?

**Decision:** Use JWT tokens with bcrypt password hashing

**Rationale:**
- **Stateless** - No server-side session storage
- **Scalable** - Works across multiple servers
- **Standard** - Well-understood, many libraries
- **Flexible** - Can include custom claims

**Implementation:**
- Passwords hashed with bcrypt (10 rounds)
- JWT signed with HS256 algorithm
- Token in both cookie and response body
- 1 hour expiration

**Trade-offs:**
- Can't invalidate tokens (until expiry)
- Token size larger than session ID
- Need to handle token refresh

**Alternatives Considered:**
- **Session-based** - Requires session store (Redis)
- **OAuth** - Overkill for simple auth
- **Passport.js** - Adds dependency, we want custom

## Why Strategy Pattern for Auth?

**Decision:** Use pluggable strategies for token extraction

**Rationale:**
- **Extensible** - Easy to add new auth methods
- **Flexible** - Support multiple token sources
- **Clean** - Separates concerns

**Built-in Strategies:**
- Cookie-based (HttpOnly)
- Header-based (Authorization: Bearer)

**Easy to extend:**
```typescript
export class ApiKeyStrategy implements AuthStrategy {
  async validate(req: Request) {
    const apiKey = req.headers['x-api-key'];
    // Validate API key
    return user;
  }
}
```

**Alternatives Considered:**
- **Single auth method** - Less flexible
- **Passport.js** - External dependency

## Why Winston for Logging?

**Decision:** Use Winston instead of console.log or other loggers

**Rationale:**
- **Structured** - JSON logging in production
- **Levels** - Different log levels (error, warn, info, debug)
- **Transports** - File, console, external services
- **Popular** - Well-maintained, large ecosystem

**Configuration:**
- Console in development
- Files in production (error.log, combined.log)
- Different levels per environment

**Alternatives Considered:**
- **console.log** - Not structured, no levels
- **Pino** - Faster but less features
- **Bunyan** - Good but less popular

## Why Jest for Testing?

**Decision:** Use Jest with Supertest for HTTP testing

**Rationale:**
- **Popular** - Industry standard for Node.js
- **Fast** - Parallel test execution
- **Features** - Mocking, coverage, snapshots
- **TypeScript** - Good TS support with ts-jest

**Testing Strategy:**
- Integration tests (full request/response)
- Real services (no mocking)
- SQLite in-memory database

**Alternatives Considered:**
- **Mocha + Chai** - More setup required
- **Vitest** - Newer, less ecosystem
- **AVA** - Good but less popular

## Why Modular Structure?

**Decision:** Organize code into feature modules

**Rationale:**
- **Separation of Concerns** - Each module is independent
- **Scalability** - Easy to add features
- **Team Work** - Different teams can own modules
- **Reusability** - Modules can be extracted

**Structure:**
```
modules/
  users/
    controllers/
    services/
    models/
    tests/
  auth/
    controllers/
    services/
    strategies/
    tests/
```

**Alternatives Considered:**
- **MVC folders** - controllers/, models/, views/ (less cohesive)
- **Flat structure** - All files in src/ (doesn't scale)

## Why No Guards/Interceptors?

**Decision:** Keep it simple, don't implement guards/interceptors yet

**Rationale:**
- **YAGNI** - You Aren't Gonna Need It (yet)
- **Simplicity** - Easier to understand
- **Extensible** - Can add later if needed

**Current Approach:**
- Check `req.user` in controllers for auth
- Handle errors in try-catch blocks
- Transform responses manually

**Future Consideration:**
Could add guards for route protection:
```typescript
@Get('/admin')
@UseGuards(AdminGuard)
async adminOnly() { }
```

## Why No Validation Library?

**Decision:** Manual validation instead of class-validator

**Rationale:**
- **Simplicity** - One less dependency
- **Flexibility** - Custom validation logic
- **Learning** - Understand validation

**Current Approach:**
```typescript
if (!email || !password) {
  return res.status(400).json({ message: 'Invalid input' });
}
```

**Future Consideration:**
Could add class-validator for complex validation:
```typescript
class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

## Why No API Versioning?

**Decision:** Single API version, no /v1/ prefix

**Rationale:**
- **Simplicity** - Easier to start
- **YAGNI** - Add when actually needed
- **Breaking Changes** - Can version later

**Future Consideration:**
Add versioning when needed:
```typescript
@Controller('/v1/users')
@Controller('/v2/users')
```

## Summary

These decisions prioritize:
1. **Simplicity** - Easy to understand
2. **Type Safety** - Leverage TypeScript
3. **Extensibility** - Easy to add features
4. **Performance** - Fast tests, efficient code
5. **Developer Experience** - Pleasant to work with

The architecture is intentionally minimal but extensible. Features can be added as needed without major refactoring.
