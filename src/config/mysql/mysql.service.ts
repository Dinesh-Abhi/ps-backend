import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MysqlService {

  constructor(private configService: ConfigService) { }

  get host(): string {
    console.log(this.configService.get<string>('mysql.host'));
    return this.configService.get<string>('mysql.host') as string;
  }

  get username(): string {
    return this.configService.get<string>('mysql.username') as string;
  }
  get port(): number {
    return Number(this.configService.get<number>('mysql.port')) as number;
  }
  get database(): string {
    return this.configService.get<string>('mysql.database') as string;
  }
  get password(): string {
    return this.configService.get<string>('mysql.password') as string;
  }
}

