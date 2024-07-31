// config.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MysqlModule } from './mysql/mysql.module';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/${process.env.NODE_ENV}.env`,
      isGlobal: true, // Make the Config module global
    }),
    MysqlModule,
  ],
})
export class ConfigAppModule {}
