import { Body, Controller, Get, Param, UseGuards, Post, ParseIntPipe, UsePipes, ValidationPipe, Request, Put } from '@nestjs/common';
import { AdminMasterDto, AdminMasterUpdateDto } from './dto/admin-master.dto';
import { AdminMasterService } from './admin-master.service';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import logger from 'src/loggerfile/logger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('Admin')
@ApiSecurity("JWT-auth")
@Controller('adminmaster')
export class AdminMasterController {
    constructor(private readonly adminMasterService: AdminMasterService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @Post('create')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async create(@Request() req, @Body() adminMasterDto: AdminMasterDto) {
        logger.debug(`reqUser: ${req.user.username} admin create is calling with body ${JSON.stringify(adminMasterDto)}`);
        const result = await this.adminMasterService.create(req.user, adminMasterDto);
        logger.debug(`reqUser: ${req.user.username} return in admin create controller > service response: ${result.Error ? `error: ${result.message}` : `Admin ${result.message}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() adminMasterUpdateDto: AdminMasterUpdateDto) {
        logger.debug(`reqUser: ${req.user.username} admin update is calling with body ${JSON.stringify(adminMasterUpdateDto)}`);
        const result = await this.adminMasterService.update(req.user, adminMasterUpdateDto);
        logger.debug(`reqUser: ${req.user.username} return in admin update controller > service response: ${result.Error ? `error: ${result.message}` : `Admin ${result.message}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @Get()
    @ApiResponse({ status: 201, description: 'The All records fetched successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(@Request() req) {
        logger.debug(`reqUser:${req.user.username} adminmaster findall is calling`);
        const result = await this.adminMasterService.findAll(req.user.username);
        logger.debug(`reqUser: ${req.user.username} return in adminmaster findall controller > service response: ${(result.Error ? `error: ${result.message}` : `admin_count:${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Get('dashboard/:clgId')
    @ApiResponse({ status: 201, description: 'The All records fetched successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getDashboardDetails(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
        logger.debug(`reqUser: ${req.user.username} admin getDashboardDetails is calling with params clgId:${clgId}`);
        const result = await this.adminMasterService.getDashboardDetails(req.user, clgId);
        logger.debug(`reqUser: ${req.user.username} return in admin getDashboardDetails controller > service response: ${(result.Error ? `error: ${result.message}` : "requested data sent")}`);
        return result;
    }
}
