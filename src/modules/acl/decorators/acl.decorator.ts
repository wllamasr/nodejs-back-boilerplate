import 'reflect-metadata';
import { Rule } from '../acl.dsl';

export const ROLES_METADATA_KEY = 'acl:roles';
export const PERMISSIONS_METADATA_KEY = 'acl:permissions';

export function Roles(rule: Rule | string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // If array, treat as OR by default or AND? Usually roles list implies "one of" (OR) or "all of" (AND)?
    // Let's assume list means OR for simplicity, or we check if array.
    // Actually, to support the requested And/Or helpers, we should standardize on Rule type.
    // If simple array of strings passed, convert to single rule? 
    // Let's support both: Rule object OR simple string array (implicitly OR or AND).
    // User asked for explicit AND/OR. Let's convert array to OR for convenience? 
    // Better: Encapsulate.

    let finalRule: Rule;
    if (Array.isArray(rule)) {
      finalRule = { op: 'OR', rules: rule }; // Defaulting behavior for array
    } else {
      finalRule = rule;
    }

    Reflect.defineMetadata(ROLES_METADATA_KEY, finalRule, target, propertyKey);
  };
}

export function Permissions(rule: Rule | string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    let finalRule: Rule;
    if (Array.isArray(rule)) {
      finalRule = { op: 'AND', rules: rule }; // Permissions usually imply "needs all these rights"? Or "needs any"?
      // Let's use AND for permissions array to be stricter by default, or OR?
      // standard is often AND. "Needs read AND write".
      // Let's stick to the user's DSL for complex cases and keep array simply as AND.
    } else {
      finalRule = rule;
    }
    Reflect.defineMetadata(PERMISSIONS_METADATA_KEY, finalRule, target, propertyKey);
  };
}
