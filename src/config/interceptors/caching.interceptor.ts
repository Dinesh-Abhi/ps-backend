import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CachingInterceptor implements NestInterceptor {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private reflector: Reflector) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const key = request?.user?.username ?? request?.user?.user?.username;
        const token = request?.headers?.authorization?.split(' ')[1];

        // Check for custom metadata
        const skipInterceptor = this.reflector.get<boolean>('skipInterceptor', context.getHandler());
        if (skipInterceptor) {
            return next.handle();
        }

        if (process.env.APP_ENV == 'development') {
            return next.handle();
        }

        const cachedToken = await this.cacheManager.get(key);
        if (cachedToken) {
            if (cachedToken === token) {
                return next.handle();
            } else {
                throw new UnauthorizedException('Invalid session token. Please try logging in again.');
            }
        } else {
            throw new UnauthorizedException('Session has expired. Please log in again to continue.');
        }
    }
}