import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe, Request, Param, ParseIntPipe, Put } from '@nestjs/common';
import { CollegeService } from './college.service';
import { CollegeDto, UpdateCollegeDto } from './dto/college.dto';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import logger from 'src/loggerfile/logger';

@ApiSecurity("JWT-auth")
@ApiTags('College')

@Controller('college')
export class CollegeController {
    constructor(private readonly collegeService: CollegeService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @Post('create')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async create(@Request() req, @Body() collegeDto: CollegeDto) {
        logger.debug(`reqUser: ${req.user.username} college create is calling with body: ${JSON.stringify(collegeDto)}`);
        const result = await this.collegeService.create(req.user.username, collegeDto);
        logger.debug(`reqUser: ${req.user.username} return in college create controller > service response: ${(result.Error ? `error: ${result.message}` : `College ${result.message}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN','ADMIN')
    @Get()
    @ApiResponse({ status: 201, description: 'The All records fetched successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(@Request() req) {
        logger.debug(`reqUser: ${req.user.username} college findAll is calling`);
        const result = await this.collegeService.findAll(req.user.username);
        logger.debug(`reqUser: ${req.user.username} return in college findAll controller > service response: ${(result.Error ? `error: ${result.message}` : `no.of colleges:${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get(':clgId')
    @ApiResponse({ status: 201, description: 'The record fetched successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findOne(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
        logger.debug(`reqUser: ${req.user.username} college findOne is calling with params collegeId: ${clgId}`);
        const result = await this.collegeService.findOne(req.user.username, clgId);
        logger.debug(`reqUser: ${req.user.username} return in controller > service response: ${(result.Error ? `error: ${result.message}` : `Requested data sent`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() updateCollegeDto: UpdateCollegeDto) {
        logger.debug(`reqUser: ${req.user.username} college update is calling`);
        const result = await this.collegeService.update(req.user.username, updateCollegeDto);
        logger.debug(`reqUser: ${req.user.username} return in college update controller > service response: ${(result.Error ? `error: ${result.message}` : `College ${result.message}`)}`);
        return result;
    }
}
