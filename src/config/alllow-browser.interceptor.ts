import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BrowserAllowInterceptor implements NestInterceptor {
  private readonly allowedBrowsers: string[] = ['Mozilla', 'Chrome', 'Safari', 'Edg', 'Firefox'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'];

    if (process.env.APP_ENV == 'development') {
      return next.handle();
    } 

    return next.handle();
  }

  private isAllowed(userAgent: string): boolean {
    // Check if the userAgent contains any of the allowed browsers/platforms
    return this.allowedBrowsers.some(browser => userAgent.includes(browser));
  }
}
