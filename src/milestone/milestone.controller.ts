import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import logger from 'src/loggerfile/logger';
import { Roles } from 'src/auth/roles.decorator';
import { MilestoneUpdateDto, MilestoneCreateDto } from './dto/milestone.dto';


@ApiTags('milestone')
@ApiSecurity("JWT-auth")
@Controller('milestone')
export class MilestoneController {
    constructor(private readonly mileStoneService: MilestoneService) { }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Post('create')
    @ApiResponse({ status: 201, description: 'The milestone record created successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async create(@Request() req, @Body() milestoneCreateDto: MilestoneCreateDto) {
        logger.debug(`reqUser: ${req.user.username} milestone create is calling with body: ${JSON.stringify(milestoneCreateDto)}`);
        const result = await this.mileStoneService.createmilestone(req.user, milestoneCreateDto);
        logger.debug(`reqUser: ${req.user.username} return in milestone create controller > service response: ${result.Error ? `error:${result.message}` : `milestone ${result.message}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() mileStoneUpdateDto: MilestoneUpdateDto) {
        logger.debug(`requser: ${req.user.username} milestone update is calling with body:${JSON.stringify(mileStoneUpdateDto)}`);
        const result = await this.mileStoneService.update(req.user.username, mileStoneUpdateDto);
        logger.debug(`requser: ${req.user.username} return in milestone update controller > service response: ${result.Error ? `error:${result.message}` : `milestone ${result.message}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN', 'MENTOR')
    @Get('ps/:psId')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findByPs(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
        logger.debug(`requser: ${req.user.username} milestone findByPs is calling with params psId:${psId}`);
        const result = await this.mileStoneService.findByPs(req.user.username, psId);
        logger.debug(`requser: ${req.user.username} return in milestone findByPs controller > service response: ${result.Error ? `error:${result.message}` : `milestones_count: ${result.payload.length}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Put('enableordisable/:msId')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async enableOrDisable(@Request() req, @Param('msId', ParseIntPipe) msId: number) {
        logger.debug(`requser: ${req.user.username} milestone enableOrDisable is calling with params msId:${msId}`);
        const result = await this.mileStoneService.enableOrDisable(req.user.username, msId);
        logger.debug(`requser: ${req.user.username} return in milestone enableOrDisable controller > ${result.Error ? `error:${result.message}` : `milestone state: ${result.message}`}`);
        return result;
    }
}
