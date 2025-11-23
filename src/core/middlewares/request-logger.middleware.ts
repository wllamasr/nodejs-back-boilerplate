import { Request, Response, NextFunction } from 'express';
import { Middleware } from '../decorators/middleware.decorator';
import { Middleware as IMiddleware } from '../interfaces/middleware.interface';
import { LoggerService } from '../logger/logger.service';

@Middleware()
export class RequestLoggerMiddleware implements IMiddleware {
  constructor(private logger: LoggerService) { }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}
