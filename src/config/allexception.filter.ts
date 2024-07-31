import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ERROR_MESSAGES } from 'src/constants';
import logger from 'src/loggerfile/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = host.switchToHttp().getRequest();

    logger.error(`
      From _peername: ${JSON.stringify(request.client?._peername)}
      reqUserIP: ${request?.connection?.remoteAddress}
      Hostname: ${request?.hostname}
      Origin: ${request?.headers['origin'] || "No origin"}
      Token: ${request?.headers?.authorization}
      User-Agent: ${request?.headers['user-agent']}
      Request Details - url: ${request?.originalUrl}
      User: ${JSON.stringify(request?.user)}
      method: ${request?.method}
      Body: ${JSON.stringify(request?.body)}
      Params: ${JSON.stringify(request?.params)}
      Query: ${JSON.stringify(request?.query)}
      Stack Trace: ${exception?.stack}
      Status Code: ${ exception?.response?.statusCode}
      Global exception occurred in application: ${JSON.stringify(exception)}`);

    if (exception.response == 'ThrottlerException: Too Many Requests') {
      return response.json({
        Error: true,
        statusCode: 401,
        message: ERROR_MESSAGES.MANY_REQUESTS,
      });
    }
    if (exception?.response) {
      if (exception.response != undefined) {
        if (exception?.response['message'] != undefined) {
          console.log(exception.response['message'], "1")
          console.log(request.originalUrl, " url")
        } else {
          console.log(exception.response, "2")
          console.log(request.originalUrl, " url")
        }
      } else {
        console.log(exception.response, "3")
        console.log(request.originalUrl, " url")
      }
    }

    if (exception.response?.statusCode === 401 || exception.response?.statusCode === 400 || exception.response?.statusCode === 403)
      return response.json({
        Error: true,
        statusCode: exception.response?.statusCode,
        message: exception.response['message'],
      });

    if (exception.response?.statusCode === 404)
      return response.json({
        Error: true,
        statusCode: 404,
        message: exception.response?.error || ERROR_MESSAGES.BAD_REQUEST,
      });
    // Handle the exception and send an appropriate response to the client
    if (exception?.response) {
      return response.json({
        Error: true,
        statusCode: 500,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
    return response.json({
      Error: true,
      statusCode: 406,
      message: exception.message ?? ERROR_MESSAGES.SERVER_ERROR,
    });
  }
}
