import { Module } from '@nestjs/common';
import { MysqlService } from './mysql.service';
import configuration from './configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration]
    }),
  ],
  providers: [ConfigService, MysqlService],
  exports: [ConfigService, MysqlService],

})
export class MysqlModule { }
