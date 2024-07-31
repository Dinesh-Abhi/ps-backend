import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { StudentMasterService } from './student-master.service';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateVirtualStudentsDto, StudentMasterBulkDto, StudentMasterUpdateDto, StudentProfileUpdateDto } from './dto/student-master.dto';
import logger from 'src/loggerfile/logger';

@ApiTags('Student')
@ApiSecurity("JWT-auth")

@Controller('studentmaster')
export class StudentMasterController {
    constructor(private readonly studentMasterService: StudentMasterService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Post('create')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async create(@Request() req, @Body() studentMasterBulkDto: StudentMasterBulkDto[]) {
        logger.debug(`reqUser: ${req.user.username} studentmaster create is calling with body ${JSON.stringify(studentMasterBulkDto)}`);
        const result = await this.studentMasterService.bulkUpload(req.user.username, studentMasterBulkDto);
        logger.debug(`reqUser: ${req.user.username} return in studentmaster create controller > service response: ${(result.Error ? `error: ${result.message}` : `Students ${result.message}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Post('createvs')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async createVirtualStudents(@Request() req, @Body() createVirtualStudentsDto: CreateVirtualStudentsDto) {
        logger.debug(`reqUser: ${req.user.username} studentmaster createVirtualStudents is calling with body ${JSON.stringify(createVirtualStudentsDto)}`);
        const result = await this.studentMasterService.createVirtualStudents(req.user.username, createVirtualStudentsDto);
        logger.debug(`reqUser: ${req.user.username} return in studentmaster createVirtualStudents controller > service response: ${(result.Error ? `error: ${result.message}` : `Virtual Students ${result.message}`)}`);
        return result;
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() studentMasterUpdateDto: StudentMasterUpdateDto) {
        logger.debug(`reqUser: ${req.user.username} studentmaster update is calling with body ${JSON.stringify(studentMasterUpdateDto)}`);
        const result = await this.studentMasterService.update(req.user.username, studentMasterUpdateDto);
        logger.debug(`reqUser: ${req.user.username} return in studentmaster update controller > service response: ${(result.Error ? `error: ${result.message}` : `Student ${result.message}`)}}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Put('studentprofileupdate')
    @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async studentProfileUpdate(@Request() req, @Body() studentProfileUpdateDto: StudentProfileUpdateDto) {
        logger.debug(`requser: ${req.user.username} studentmaster studentProfileUpdate is calling with body ${JSON.stringify(studentProfileUpdateDto)}`);
        const result = await this.studentMasterService.studentProfileUpdate(req.user, studentProfileUpdateDto);
        logger.debug(`requser: ${req.user.username} return in studentmaster studentProfileUpdate controller > service response: ${(result.Error ? `error: ${result.message}` : `Profile ${result.message}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Get('ps/:psId')
    @ApiResponse({ status: 201, description: 'The record has been successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAllByPs(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
        logger.debug(`reqUser: ${req.user.username} studentmaster findAllByPs is calling with params psId: ${psId}`);
        const result = await this.studentMasterService.findAllByPs(req.user, psId);
        logger.debug(`reqUser: ${req.user.username} return in studentmaster findAllByPs controller > service response: ${(result.Error ? `error: ${result.message}` : `Ps_count: ${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('college/:clgId')
    @ApiResponse({ status: 201, description: 'The record has been successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAllByCollege(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
        logger.debug(`reqUser: ${req.user.username} studentmaster findAllByCollege is calling with params clgId: ${clgId}`);
        const result = await this.studentMasterService.findAllByCollege(req.user.username, clgId, "MANAGE");
        logger.debug(`reqUser: ${req.user.username} return in studentmaster findAllByCollege controller > service response: ${(result.Error ? `error: ${result.message}` : `Ps_count: ${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('syncsection/:clgId')
    @ApiResponse({ status: 201, description: 'The record has been successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async syncSection(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
        logger.debug(`reqUser: ${req.user.username} studentmaster syncSection is calling with params clgId: ${clgId}`);
        const result = await this.studentMasterService.syncSection(req.user.username, clgId);
        logger.debug(`reqUser: ${req.user.username} return in studentmaster syncSection controller > service response: ${(result.Error ? `error: ${result.message}` : `Students Sections ${result.message}`)}`);
        return result;
    }
}
