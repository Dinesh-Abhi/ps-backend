// config.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MysqlModule } from './mysql/mysql.module';
import * as dotenv from 'dotenv';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './redis.options';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { CachingInterceptor } from './interceptors/caching.interceptor';
import { BrowserAllowInterceptor } from './interceptors/alllow-browser.interceptor';

dotenv.config(); // Load environment variables from .env file

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/${process.env.NODE_ENV}.env`,
      isGlobal: true, // Make the Config module global
    }),
    CacheModule.registerAsync(RedisOptions),
    MysqlModule,
  ],
  providers: [
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: CachingInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: BrowserAllowInterceptor,
    // },
  ]
})
export class ConfigAppModule { }
