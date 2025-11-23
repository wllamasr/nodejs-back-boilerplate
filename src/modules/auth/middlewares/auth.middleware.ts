import { Request, Response, NextFunction } from 'express';
import { Middleware } from '../../../core/decorators/middleware.decorator';
import { Middleware as IMiddleware } from '../../../core/interfaces/middleware.interface';
import { AuthService } from '../services/auth.service';
import { AuthStrategy } from '../strategies/auth-strategy.interface';
import { JwtCookieStrategy } from '../strategies/jwt-cookie.strategy';
import { JwtHeaderStrategy } from '../strategies/jwt-header.strategy';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  private strategies: AuthStrategy[];

  constructor(private authService: AuthService) {
    this.strategies = [
      new JwtCookieStrategy(authService),
      new JwtHeaderStrategy(authService),
    ];
  }

  async use(req: Request, res: Response, next: NextFunction) {
    for (const strategy of this.strategies) {
      const user = await strategy.validate(req);
      if (user) {
        (req as any).user = user;
        return next();
      }
    }
    // If no strategy validates, we don't set user, but we don't block request.
    // Guards will handle blocking if needed.
    next();
  }
}
