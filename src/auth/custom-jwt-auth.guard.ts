import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class CustomJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    if (err || !user) {
      // Handle UnauthorizedException specifically for token expiration
      if (err instanceof UnauthorizedException && err.message === 'jwt expired') {
        throw ERROR_MESSAGES.TOKEN_EXPIRE;
      }
      throw err || ERROR_MESSAGES.UNAUTHORIZED_ACCESS;
    }
    return user;
  }
}
