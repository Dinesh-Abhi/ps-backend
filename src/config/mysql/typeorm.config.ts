import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
dotenv.config({ path: __dirname + '/../../../production.env' })

const configService = new ConfigService;
export default new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'], //Specifies the entity files path where typeorm should loock for entities
  migrations: [__dirname + '/../../../migrations/*.ts'], //Specifies the migrations files path where typeorm should loock for migrations
  synchronize: false,
  dropSchema: false,
  logging: ["migration"],
  logger: 'file',
});