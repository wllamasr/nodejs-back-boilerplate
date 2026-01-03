# ACL System Guide

## Overview
This project includes a robust Access Control List system allowing complex authorization rules involving Roles and Permissions.

## Components

### 1. Decorators
Protected routes are decorated in the controller.

```typescript
import { Roles, Permissions } from '@/modules/acl/decorators/acl.decorator';
import { And, Or } from '@/modules/acl/acl.dsl';

@Get('/')
@Roles('admin') // Simple role check
findAll() {}

@Post('/')
@Permissions(Or('write', 'super_edit')) // Complex permission check
create() {}
```

### 2. Manual Verification
You can perform checks programmatically using `AclService`.

```typescript
constructor(private acl: AclService) {}

async action(userId: number) {
  // Check complicated rule manually
  const canAct = await this.acl.userHasPermission(userId, And('delete', 'archive'));
  if (!canAct) throw new Error('Nope');
}
```

## Setup & Migration
The ACL module includes explicit SQL models.
Run `npm run db:push` to sync the schema.

## Debugging
- If `Forbidden` is returned, check `users_roles` and `roles_permissions` tables.
- Ensure the User ID is correctly attached to `context.user` or `context.store.user` by your Auth middleware.
