import { db } from '../../../framework/database';
import { roles, permissions, rolesPermissions } from '../../modules/acl/models/acl.model';
import { STATIC_ROLES, STATIC_PERMISSIONS, STATIC_ROLE_PERMISSIONS } from './definitions';
import { eq } from 'drizzle-orm';
import { logger } from '../../../framework/logger';

// const logger = new Logger('ACL-Seeder'); // Not needed if we use the instance


export async function seedStaticAcl() {
  logger.info('Seeding Static ACL...');

  // 1. Upsert Permissions
  for (const perm of STATIC_PERMISSIONS) {
    await db
      .insert(permissions)
      .values(perm)
      .onConflictDoUpdate({
        target: permissions.slug,
        set: { name: perm.name, description: perm.description },
      });
  }

  // 2. Upsert Roles
  for (const role of STATIC_ROLES) {
    await db
      .insert(roles)
      .values(role)
      .onConflictDoUpdate({
        target: roles.slug,
        set: { name: role.name, description: role.description },
      });
  }

  // 3. Assign Permissions to Roles
  // First, we need to fetch IDs for roles and permissions
  const allRoles = await db.select().from(roles);
  const allPerms = await db.select().from(permissions);

  const roleMap = new Map(allRoles.map((r) => [r.slug, r.id]));
  const permMap = new Map(allPerms.map((p) => [p.slug, p.id]));

  for (const [roleSlug, permSlugs] of Object.entries(STATIC_ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleSlug);
    if (!roleId) continue;

    for (const permSlug of permSlugs) {
      const permId = permMap.get(permSlug);
      if (!permId) continue;

      await db
        .insert(rolesPermissions)
        .values({ roleId, permissionId: permId })
        .onConflictDoNothing();
    }
  }

  logger.info('Static ACL Seeding Completed.');
}
