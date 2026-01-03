export type Rule = string | { op: 'AND' | 'OR', rules: Rule[] };

export const And = (...rules: Rule[]) => ({ op: 'AND' as const, rules });
export const Or = (...rules: Rule[]) => ({ op: 'OR' as const, rules });
