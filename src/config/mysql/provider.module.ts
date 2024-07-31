import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MysqlModule } from './mysql.module';
import { MysqlService } from './mysql.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [MysqlModule],
      useFactory: (mysqlService: MysqlService): TypeOrmModuleOptions => ({
        type: 'mysql',
        host: mysqlService.host,
        port: mysqlService.port,
        username: mysqlService.username,
        password: mysqlService.password,
        database: mysqlService.database,
        timezone: '+05:30',
        autoLoadEntities: true,
        charset: 'latin1',
        synchronize: true,
        logging: ["error"],
        logger: "file",
        migrationsRun: false,
      }),
      inject: [MysqlService],
    }),
  ],
})
export class MysqlDatabaseProviderModule { }
