import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuditLogService } from './auditlog.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import logger from 'src/loggerfile/logger';

@ApiTags('AuditLog')
@ApiSecurity("JWT-auth")

@Controller('auditlog')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get()
    @ApiResponse({ status: 201, description: 'The All records fetched successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(@Request() req) {
        logger.debug(`reqUser: ${req.user.username} auditLog findall is calling`);
        const result = await this.auditLogService.findAll(req.user.username);
        logger.debug(`reqUser: ${req.user.username} return in  auditLog findal controller > service response: ${(result.Error ? `error: ${result.message}` : `aditlogs_count: ${result.payload.length}`)}`);
        return result;
    }
}
