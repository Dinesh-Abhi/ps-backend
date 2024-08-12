import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BrowserAllowInterceptor implements NestInterceptor {
  private readonly allowedBrowsers: string[] = ['Mozilla', 'Chrome', 'Safari', 'Edg', 'Firefox'];

  constructor(private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'];

    // Check for custom metadata
    const skipInterceptor = this.reflector.get<boolean>('skipInterceptor', context.getHandler());
    if (skipInterceptor) {
      return next.handle();
    }

    if (!this.isAllowed(userAgent)) {
      throw new ForbiddenException('Access from this browser or platform is not allowed.');
    }

    return next.handle();
  }

  private isAllowed(userAgent: string): boolean {
    return this.allowedBrowsers.some(browser => userAgent.includes(browser));
  }
}
