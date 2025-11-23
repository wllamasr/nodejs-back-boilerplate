import { Request } from 'express';
import { AuthStrategy } from './auth-strategy.interface';
import { AuthService } from '../services/auth.service';

export class JwtCookieStrategy implements AuthStrategy {
  constructor(private authService: AuthService) { }

  async validate(req: Request): Promise<any | null> {
    const token = req.cookies['Authentication'];
    if (!token) {
      return null;
    }
    return this.authService.verifyToken(token);
  }
}
