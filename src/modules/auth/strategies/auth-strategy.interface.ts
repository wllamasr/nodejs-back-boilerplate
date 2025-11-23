import { Request } from 'express';

export interface AuthStrategy {
  validate(req: Request): Promise<any | null>;
}
