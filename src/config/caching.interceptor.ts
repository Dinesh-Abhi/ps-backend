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

@Injectable()
export class CachingInterceptor implements NestInterceptor {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const key = request?.user?.username ?? request?.user?.user?.username;
        const token = request?.headers?.authorization?.split(' ')[1]; // Extract token from Authorization header
        
        if (request.url == '/auth/login') {
            return next.handle();
        } else if (process.env.APP_ENV == 'development') {
            return next.handle();
        }
        
        const cachedToken = await this.cacheManager.get(key);
        if (request.url == '/auth/logout') {
            return next.handle();
        }
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