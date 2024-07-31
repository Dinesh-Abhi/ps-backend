import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomJwtAuthGuard } from './custom-jwt-auth.guard';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import logger from 'src/loggerfile/logger';
const axios = require("axios");

@ApiTags('LogIn')
@ApiSecurity("JWT-auth")

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService
  ) { }

  @Post('refresh')
  @ApiResponse({ status: 201, description: 'The token refresh successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async refreshAccessToken(@Body() refreshDto: RefreshDto) {
    const accessToken = await this.authService.refreshAccessToken(refreshDto.refreshToken);
    return { access_token: accessToken };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiResponse({ status: 201, description: 'The login successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async login(@Request() req) {
    console.log(req?.headers['user-agent'])
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
  logout(@Request() req) {
    return this.authService.logout(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiResponse({ status: 201, description: 'The request successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getProfile(@Request() req) {
    return req.user;
  }
}
