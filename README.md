# Express Boilerplate

A modular Express.js boilerplate with NestJS-like architecture, featuring TypeScript, DrizzleORM, decorator-based routing, and comprehensive authentication.

## Features

- 🎯 **Decorator-based Routing** - `@Controller`, `@Get`, `@Post`, etc.
- 🏗️ **Modular Architecture** - Organize code with `@Module` decorator
- 💉 **Dependency Injection** - Simple DI container for services
- 🔒 **JWT Authentication** - Bcrypt password hashing + JWT tokens
- 🛡️ **Middleware Support** - Decorator-based with DI
- 🗄️ **DrizzleORM** - Type-safe queries (MySQL + SQLite for tests)
- ⚙️ **TypeScript Config** - Environment-based configuration
- 📝 **Winston Logging** - Structured logging
- ✅ **Jest Testing** - Fast tests with in-memory SQLite

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run db:push

# Start development server
npm run dev

# Run tests
npm test
```

## Project Structure

```
src/
├── core/           # Framework code (DI, decorators, etc.)
├── modules/        # Feature modules (users, auth, etc.)
├── config/         # Environment configurations
├── app.module.ts   # Root module
└── app.ts          # Entry point
```

## Documentation

- **[Getting Started](docs/getting-started.md)** - Installation and basic usage
- **[User Guide](docs/user-guide.md)** - How to use the framework
- **[API Reference](docs/api-reference.md)** - API endpoints documentation
- **[Development Guide](docs/development-guide.md)** - Adding features step-by-step
- **[Architecture](docs/architecture.md)** - Technical architecture deep dive
- **[Design Decisions](docs/design-decisions.md)** - Why we made certain choices

## Example: Creating a Controller

```typescript
import { Controller } from './core/decorators/controller.decorator';
import { Get, Post } from './core/decorators/http-methods.decorator';

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

## Scripts

```bash
npm run dev          # Development server with auto-reload
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run db:generate  # Generate database migration
npm run db:push      # Apply schema to database
```

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** DrizzleORM
- **Database:** MySQL (production), SQLite (tests)
- **Authentication:** JWT + bcrypt
- **Testing:** Jest + Supertest
- **Logging:** Winston

## License

MIT

## Contributing

See [Development Guide](docs/development-guide.md) for details on how to contribute.
