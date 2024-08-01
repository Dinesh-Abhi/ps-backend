import { Controller, Post, Body, UseGuards, Request, Get, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomJwtAuthGuard } from './custom-jwt-auth.guard';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import logger from 'src/loggerfile/logger';
const axios = require("axios");
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('LogIn')
@ApiSecurity("JWT-auth")

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiResponse({ status: 201, description: 'The login successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async login(@Request() req) {
    // try {
    //   const response = await axios.post(
    //     `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${req.body.token}`
    //   );
    //   // Check response status and send back to the client-side
    //   if (response.data.success) {
    //     if (req.user.error)
    //       throw req.user.message;
    logger.debug(`login request for user: ${((!req.user || req.user.error) ? req.user.message : JSON.stringify(req.user.user))}`)
    return await this.authService.login(req.user);

    //   } else {
    //     return { Error: true, message: 'Invalid reCAPTCHA' }
    //   }
    // } catch (error) {
    //   return { Error: true, message: error }
    // }
  }

  @Get('logout')
  @ApiResponse({ status: 201, description: 'logout successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(CustomJwtAuthGuard)
  async logout(@Request() req) {
    const cachedToken = await this.cacheManager.get(req.user.username);
    const token = req?.headers?.authorization;
    if (cachedToken == token){
      return this.authService.logout(req.user);
    }
    else{
      return {
        Error: false,
        message: "logout successfull"
      };
    }
  }
}
