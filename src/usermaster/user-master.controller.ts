import { Body, Controller, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import logger from 'src/loggerfile/logger';
import { ChangePasswordDto, ResetPasswordDto } from './dto/user-master.dto';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserMasterService } from './user-master.service';

@ApiTags('User')
@ApiSecurity("JWT-auth")

@Controller('usermaster')
export class UserMasterController {
    constructor(private readonly userMasterService: UserMasterService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Put('changepassword')
    @ApiResponse({ status: 201, description: 'The record fetched successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async updatePasswordByAdmin(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        logger.debug(`reqUser: ${req.user.username} usermaster updatePasswordByAdmin is calling with payload: ${JSON.stringify(changePasswordDto)}`);
        const result = await this.userMasterService.updatePasswordByAdmin(req.user.username, changePasswordDto);
        logger.debug(`reqUser: ${req.user.username} return in usermaster updatePasswordByAdmin controller > service response: ${result.Error ? `error: ${result.message}` : result.message}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MENTOR', 'CORRDINATOR', 'ADMIN', 'STUDENT', 'SUPERADMIN', 'EVALUATOR')
    @Put('resetpassword')
    @ApiResponse({ status: 201, description: 'The record fetched successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async ResetPassword(@Request() req, @Body() resetPasswordDto: ResetPasswordDto) {
        try {
            logger.debug(`reqUser: ${req.user.username} usermaster ResetPassword is calling with payload:${JSON.stringify(resetPasswordDto)}`);
            if (req.user.username === resetPasswordDto.username) {
                const result = await this.userMasterService.ResetPassword(req.user, resetPasswordDto);
                logger.debug(`reqUser: ${req.user.username} return in usermaster ResetPassword controller > ${(result.Error ? `error: ${result.message}` : result.message)}`);
                return result;
            } else {
                logger.debug(`reqUser: ${req.user.username} return in usermaster ResetPassword controller > username was incorrect`);
                return { Error: true, message: `You're ${req.user.username} is incorrect and can't change ${resetPasswordDto.username} password` }
            }
        } catch (error) {
            logger.error(`reqUser: ${req.user.username} error: ${(typeof error == 'object' ? error.message : error)} > error in ResetPassword controller`);
            return { Error: true, message: (typeof error == 'object' ? error.message : error) };
        }
    }
}
