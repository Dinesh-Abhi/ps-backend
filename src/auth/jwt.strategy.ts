import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './jwt.constants';
import { ERROR_MESSAGES } from 'src/constants';
import logger from 'src/loggerfile/logger';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // Check if the token has expired
    const isTokenExpired = Date.now() > payload.exp * 1000;
    if (isTokenExpired) {
      logger.debug(`Session Expire for the user: ${payload?.username}`)
      throw ERROR_MESSAGES.SESSION_EXPIRE
    }
    return { sub: payload.sub, username: payload.username, role: payload.role, name: payload.name };
  }
}
