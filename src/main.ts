import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './config/allexception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import logger from './loggerfile/logger';


async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  const whitelist = [
    process.env.APP_WEBSITE_URL as string,
    process.env.APP_WEBSITE_URL1 as string,
    process.env.APP_WEBSITE_URL2 as string,
    process.env.APP_WEBSITE_URL3 as string,
  ];

  if (process.env.APP_ENV == undefined || process.env.APP_ENV == 'development') {
    app.enableCors({
      origin: '*',
      allowedHeaders: ['Authorization', 'content-type'],
      credentials: true,
    });
  } else {
    app.enableCors({ //production environment
      origin:
        process.env.APP_ENV == 'production'
          ? function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
              // console.log('allowed cors for:', origin);
              callback(null, true);
            }
            else if (!origin) {
              // console.log(" it is a self origin")
              callback(null, true);
            }
            else {
              logger.error(`blocked cors for: ${origin}`)
              console.log('blocked cors for:', origin);
              callback(new Error('Not allowed by CORS'));
            }
          }
          : whitelist,
      allowedHeaders: ['content-type', 'Authorization'],
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'PATCH', 'DELETE'],
    });
  }

  const authMiddleware = basicAuth({
    users: { [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD },
    challenge: true,
  });
  app.use('/api', authMiddleware);

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  const options = new DocumentBuilder()
    .setTitle('Project School')
    .setVersion('1.0')
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      name: "JWT",
      description: "Enter JWT Access Token",
      in: "header"
    }, "JWT-auth").build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(`${process.env.APP_PORT}`, () => {
    logger.info(`NestJs API server started on : ${process.env.APP_PORT}`);
  });
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
