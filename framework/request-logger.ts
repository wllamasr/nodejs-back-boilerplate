import { Elysia } from 'elysia';
import { logger } from './logger';

export const requestLogger = (app: Elysia) =>
  app.onRequest(({ request }) => {
    logger.info(`${request.method} ${request.url}`);
  });
