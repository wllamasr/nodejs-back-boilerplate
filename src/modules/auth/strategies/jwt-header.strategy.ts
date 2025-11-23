import { Request } from 'express';
import { AuthStrategy } from './auth-strategy.interface';
import { AuthService } from '../services/auth.service';

export class JwtHeaderStrategy implements AuthStrategy {
  constructor(private authService: AuthService) { }

  async validate(req: Request): Promise<any | null> {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }
    return this.authService.verifyToken(token);
  }
}
