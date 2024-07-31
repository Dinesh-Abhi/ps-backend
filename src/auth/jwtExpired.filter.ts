// jwtExpired.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { TokenExpiredError } from 'jsonwebtoken';
import { ERROR_MESSAGES } from 'src/constants';

@Catch(TokenExpiredError)
export class JwtExpiredFilter implements ExceptionFilter {
  catch(exception: TokenExpiredError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = 406;

    response.status(status).json({
      statusCode: status,
      message: ERROR_MESSAGES.TOKEN_EXPIRE // Custom error message for token expiration
    });
  }
}
