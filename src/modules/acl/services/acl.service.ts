import { db } from '../../../../framework/database';
import { usersRoles, rolesPermissions, usersPermissions, roles, permissions } from '../models/acl.model';
import { eq, inArray } from 'drizzle-orm';
import { Rule } from '../acl.dsl';

export class AclService {

  /**
   * Loads all effective permissions (direct + inherited from roles) for a user.
   */
  async getEffectivePermissions(userId: number): Promise<Set<string>> {
    // 1. Get permissions from roles
    const userRolesResult = await db
      .select({
        permissionSlug: permissions.slug
      })
      .from(usersRoles)
      .innerJoin(roles, eq(usersRoles.roleId, roles.id))
      .innerJoin(rolesPermissions, eq(roles.id, rolesPermissions.roleId))
      .innerJoin(permissions, eq(rolesPermissions.permissionId, permissions.id))
      .where(eq(usersRoles.userId, userId));

    // 2. Get direct permissions
    const userDirectPermissionsResult = await db
      .select({
        permissionSlug: permissions.slug
      })
      .from(usersPermissions)
      .innerJoin(permissions, eq(usersPermissions.permissionId, permissions.id))
      .where(eq(usersPermissions.userId, userId));

    const perms = new Set<string>();
    userRolesResult.forEach((row: { permissionSlug: string }) => perms.add(row.permissionSlug));
    userDirectPermissionsResult.forEach((row: { permissionSlug: string }) => perms.add(row.permissionSlug));

    return perms;
  }

  async getUserRoles(userId: number): Promise<Set<string>> {
    const result = await db
      .select({ roleSlug: roles.slug })
      .from(usersRoles)
      .innerJoin(roles, eq(usersRoles.roleId, roles.id))
      .where(eq(usersRoles.userId, userId));

    const rolesSet = new Set<string>();
    result.forEach((row: { roleSlug: string }) => rolesSet.add(row.roleSlug));
    return rolesSet;
  }

  async userHasRole(userId: number, rule: Rule): Promise<boolean> {
    return this.evaluateRule(userId, rule, 'role');
  }

  async userHasPermission(userId: number, rule: Rule): Promise<boolean> {
    return this.evaluateRule(userId, rule, 'permission');
  }

  async evaluateRule(userId: number, rule: Rule, type: 'role' | 'permission'): Promise<boolean> {
    if (type === 'role') {
      const userRoles = await this.getUserRoles(userId);
      return this._evaluate(rule, userRoles);
    } else {
      const userPerms = await this.getEffectivePermissions(userId);
      return this._evaluate(rule, userPerms);
    }
  }

  private _evaluate(rule: Rule, capabilities: Set<string>): boolean {
    if (typeof rule === 'string') {
      return capabilities.has(rule);
    }

    if (rule.op === 'AND') {
      return rule.rules.every(r => this._evaluate(r, capabilities));
    }

    if (rule.op === 'OR') {
      return rule.rules.some(r => this._evaluate(r, capabilities));
    }

    return false;
  }
}
