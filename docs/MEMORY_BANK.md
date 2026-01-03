# Project Memory Bank & Architecture Reference

This document serves as the "Source of Truth" for the technical architecture of this custom Node.js/Bun + Elysia framework. It explains the "Magic" under the hood.

## 1. Core Framework Architecture

### The Bootstrap Process
The application entry point is `src/index.ts`. Unlike standard Elysia apps, this project uses a custom Bootstrap mechanism to mimic NestJS-like modules.

key file: `src/framework/bootstrap.ts`

**Flow:**
1. **AppModule**: The root module defined in `src/app.module.ts`.
2. **Resolution (`resolveControllers`, `resolveMiddlewares`)**: 
   - The bootstrap functions recursively traverse the `@Module` imports tree.
   - It collects all uniquely distinct Controllers and Middlewares found in metadata.
3. **Registration (`registerControllers`, `registerMiddlewares`)**:
   - **Middlewares**: Instantiated via DI Container and bound to the app using `.use()`.
   - **Controllers**: 
     - Instantiated via DI Container.
     - Metadata (`@Controller`, `@Get`, `@Post`, etc.) is read via Reflection.
     - A sub-Elysia app (plugin) is created for the controller prefix.
     - **Constraint**: `Reflect.getMetadata` for route params is pre-calculated *once* at startup to avoid runtime overhead (Performance Optimization).

### Dependency Injection (DI)
- **Container**: Simple Singleton map implementation in `src/core/di/container.ts`.
- **Injection**: Currently uses `new Service()` in many places, but supports `Container.get(Service)`.
- **Lifecycle**: Singletons by default in the current implementation.

## 2. ACL System (Access Control List)

### Architecture
Implemented in `src/modules/acl`.
- **Type**: RBAC (Role-Based) + PBAC (Permission-Based).
- **Guard**: Implemented globally in `framework/bootstrap.ts` inside the route handler wrapper.

### Database Schema
- `roles`: `id`, `slug` (unique), `name`.
- `permissions`: `id`, `slug` (unique), `name`.
- `users_roles`: Many-to-Many user roles.
- `users_permissions`: Direct permission overrides for users.
- `roles_permissions`: Permissions assigned to roles.

### Logic & DSL (`src/modules/acl/acl.dsl.ts`)
Supports explicit Boolean Logic for rules.
- **Rule Type**: `string | { op: 'AND' | 'OR', rules: Rule[] }`
- **Helpers**: `And(...)`, `Or(...)`

### Decorators
- `@Roles(Rule)`: Attaches `ROLES_METADATA_KEY` to route.
- `@Permissions(Rule)`: Attaches `PERMISSIONS_METADATA_KEY` to route.

### Evaluation Flow
1. **Guard** checks if route has metadata.
2. If yes, extracts `user.id` from `context.store.user` (populated by Auth).
3. Calls `AclService.evaluateRule`.
4. `AclService` fetches:
   - User Roles.
   - User Direct Permissions.
   - Permissions inherited via Roles.
5. Recursively evaluates the AND/OR tree against the set of capabilities.

## 3. Performance Optimizations

### Critical Fixes (Jan 2026)
1. **Reflection Caching**: `bootstrap.ts` was modified to read `@Param` metadata *outside* the request handler closure. This moved expensive reflection operations from Request Time to Startup Time.
2. **Async Logging**: Replaced blocking `console.log` middleware with `winston` (Framework Logger).

## 4. How to Modify

### Adding a New Module
1. Create module directory `src/modules/feature`.
2. Create `feature.module.ts` using `@Module`.
3. Add `imports: [FeatureModule]` to `src/app.module.ts` (or parent module).
4. **Controllers & Middlewares**: Must be listed in the Module's metadata to be loaded.

### Modifying ACL
- **New Logic**: Update `acl.dsl.ts` and `AclService._evaluate`.
- **Schema**: Update `src/modules/acl/models/acl.model.ts` and run `npm run db:push`.
