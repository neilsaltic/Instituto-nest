import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const ms = Date.now() - start;

          this.logger.log(`${method} ${url} ${statusCode} — ${ms}ms`);
        },
        error: (error) => {
          const ms = Date.now() - start;
          const status =
            error instanceof HttpException ? error.getStatus() : 500;

          this.logger.error(
            `${method} ${url} ${status} — ${ms}ms | Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
