import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ERROR_MESSAGES } from 'src/constants';
import logger from 'src/loggerfile/logger';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    logger.debug(`Localauthguard validate user: ${username} password: ${password}`)
    const user = await this.authService.validateUser(username, password);
    // console.log(" validate in local strategy ", user);
    if (!user) {
      return { "error": true, "message": ERROR_MESSAGES.INVALID_CREDENTIALS }
    }
    return { "error": false, user: user };
  }
}
