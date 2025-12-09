export class RequestLoggerMiddleware {
  handle(req: Request) {
    console.log(`${req.method} ${req.url}`);
  }
}
