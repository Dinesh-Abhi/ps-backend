import { Controller, Request, UseGuards, Get, Body, Post, ValidationPipe, UsePipes, ParseIntPipe, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import logger from 'src/loggerfile/logger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Cron } from '@nestjs/schedule';
import { MarkAttendanceByAdminDto, BulkMarkAttendanceDto } from './dto/attendance.dto';

@ApiTags('attendance')
@ApiSecurity("JWT-auth")
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }


    // this is for daily attendance mark service
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MENTOR')
    @Post('bulkmarkattendance')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async bulkMarkAttendance(@Request() req, @Body() bulkMarkAttendanceDto: BulkMarkAttendanceDto[]) {
        logger.debug(`reqUser: ${req.user.username} Attendance bulkMarkAttendance is calling with body ${JSON.stringify(bulkMarkAttendanceDto)}`);
        const result = await this.attendanceService.bulkMarkAttendance(req.user, bulkMarkAttendanceDto);
        logger.debug(`reqUser: ${req.user.username} return in Attendance bulkMarkAttendance controller > service response: ${(result.Error ? `error: ${result.message}` : `${result.message} and dub_count: ${result.payload.dup.length}`)}`)
        return result;
    }

    // this is for daily attendance mark service within PS only, to sync use sync attendance service which is in studentps file
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('markattendancebyadmin')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async markAttendanceByAdmin(@Request() req, @Body() markAttendanceByAdminDto: MarkAttendanceByAdminDto) {
        logger.debug(`reqUser: ${req.user.username} Attendance markAttendanceByAdmin is calling with body ${JSON.stringify(markAttendanceByAdminDto)}`);
        const result = await this.attendanceService.markAttendanceByAdmin(req.user, markAttendanceByAdminDto);
        // logger.debug(`reqUser: ${req.user.username} return in Attendance bulkMarkAttendance controller > service response: ${(result.Error ? `error: ${result.message}` : `${result.message} and dub_count: ${result.payload.dup.length}`)}`)
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Get('allstudentsattendance/:psId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getAllStudentsAttendance(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
        logger.debug(`reqUser: ${req.user.username} Attendance getAllStudentsAttendance is calling with psId: ${psId}`);
        const result = await this.attendanceService.getAllStudentsAttendance(req.user, psId);
        logger.debug(`reqUser: ${req.user.username} > return in Attendance getAllStudentsAttendance controller > service response: ${(result.Error ? `error: ${result.message}` : `Students_count: ${result.payload.length}`)}`);
        return result;
    }

    @Cron('15 18,19 * * *')
    markAbsentAttendanceAtEndOfDayCornJob() {
        this.attendanceService.markAbsentAttendanceAtEndOfDayCornJob();
    }
}
