import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { SkipInterceptor } from './config/interceptors/skip.interceptor';

@ApiTags("Home")

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Get()
  @SkipInterceptor()
  getHello(): string {
    return this.appService.getHello();
  }
}