import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import * as path from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import logger from 'src/loggerfile/logger';
import { EvaluatorStudentService } from './evaluator-student.service';
import { BulkCreateEvaluatorGroupStudentDto, BulkCreateEvaluatorIndividualStudentDto, BulkUploadEvaluatorGroupWiseDto, BulkUploadEvaluatorIndividualWiseDto, UpdateEvaluatorStudentTypeDto, UpdateEvaluatorToStudentDto } from './dto/evaluator-student.dto';

@ApiSecurity("JWT-auth")
@ApiTags('Evaluator Student')
@Controller('evaluatorstudent')
export class EvaluatorStudentController {
    constructor(private readonly evaluatorStudentService: EvaluatorStudentService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('createindividual')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async createIndividualStudent(@Request() req, @Body() bulkCreateEvaluatorIndividualStudentDto: BulkCreateEvaluatorIndividualStudentDto) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent createIndividualStudent is calling with body: ${JSON.stringify(bulkCreateEvaluatorIndividualStudentDto)}`);
        const result = await this.evaluatorStudentService.createIndividualStudent(req.user.username, bulkCreateEvaluatorIndividualStudentDto);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent createIndividualStudent controller > service response: ${result.Error ? `error: ${result.message}` : `response: ${result.message}} dublicates student or group ids: [${result?.payload}]`}}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('creategroup')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async createGroupStudent(@Request() req, @Body() bulkCreateEvaluatorGroupStudentDto: BulkCreateEvaluatorGroupStudentDto) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent createGroupStudent is calling with body: ${JSON.stringify(bulkCreateEvaluatorGroupStudentDto)}`);
        const result = await this.evaluatorStudentService.createGroupStudent(req.user.username, bulkCreateEvaluatorGroupStudentDto);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent createGroupStudent controller > service response: ${result.Error ? `error: ${result.message}` : `response: ${result.message}} dublicates student or group ids: [${result?.payload}]`}}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN','ADMIN')
    @Post('bulkuploadindiviualwise')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async bulkUploadIndividulalWise(@Request() req, @Body() bulkUploadEvaluatorIndividualWiseDto: BulkUploadEvaluatorIndividualWiseDto[]) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent bulkUploadIndividulalWise is calling with body: ${JSON.stringify(bulkUploadEvaluatorIndividualWiseDto)}`);
        const result = await this.evaluatorStudentService.bulkUploadIndividulalWise(req.user.username, bulkUploadEvaluatorIndividualWiseDto);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent bulkUploadIndividulalWise controller > service response: ${result.Error ? `error: ${result.message}` : `response: ${result.message}} dublicates students: [${result?.payload}]`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN','ADMIN')
    @Post('bulkuploadgroupwise')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async bulkUploadGroupWise(@Request() req, @Body() bulkUploadEvaluatorGroupWiseDto: BulkUploadEvaluatorGroupWiseDto[]) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent bulkUploadGroupWise is calling with body: ${JSON.stringify(bulkUploadEvaluatorGroupWiseDto)}`);
        const result = await this.evaluatorStudentService.bulkUploadGroupWise(req.user.username, bulkUploadEvaluatorGroupWiseDto);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent bulkUploadGroupWise controller > service response: ${result.Error ? `error: ${result.message}` : `response: ${result.message}} dublicates students: [${result?.payload}]`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN','ADMIN')
    @Put('updateevaluator')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async updateEvaluator(@Request() req, @Body() updateEvaluatorToStudentDto: UpdateEvaluatorToStudentDto) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent updateEvaluator is calling with body: ${JSON.stringify(updateEvaluatorToStudentDto)}`);
        const result = await this.evaluatorStudentService.updateEvaluator(req.user.username, updateEvaluatorToStudentDto);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent updateEvaluator controller > service response: ${result.Error ? `error: ${result.message}` : `response: ${result.message}}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN','ADMIN')
    @Put('updatetype')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async updateESType(@Request() req, @Body() updateEvaluatorStudentTypeDto: UpdateEvaluatorStudentTypeDto) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent updateESType is calling with body: ${JSON.stringify(updateEvaluatorStudentTypeDto)}`);
        const result = await this.evaluatorStudentService.updateESType(req.user.username, updateEvaluatorStudentTypeDto);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent updateESType controller > service response: ${result.Error ? `error: ${result.message}` : `response: ${result.message}}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN','ADMIN')
    @Get('findstudentsbyschedule/:escheduleId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findStudentsBySchedule(@Request() req, @Param('escheduleId', ParseIntPipe) escheduleId: number) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent findStudentsBySchedule is calling with params: escheduleId: ${escheduleId}`);
        const result = await this.evaluatorStudentService.findStudentsBySchedule(req.user.username, escheduleId);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent findStudentsBySchedule controller > service response: ${result.Error ? `error: ${result.message}` : `students_count: ${result.payload.length}`}}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR')
    @Get('findbyevaluatorandschedule/:escheduleId/:evaluatorId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findStudentsByEvaluatorAndSchedule(@Request() req, @Param('escheduleId', ParseIntPipe) escheduleId: number, @Param('evaluatorId', ParseIntPipe) evaluatorId: number) {
        logger.debug(`reqUser:${req.user.username} EvaluatorStudent findStudentsByEvaluatorAndSchedule is calling with params escheduleId:${escheduleId}, evaluatorId:${evaluatorId}`);
        const result = await this.evaluatorStudentService.findStudentsByEvaluatorAndSchedule(req.user.username, escheduleId, evaluatorId);
        logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent findStudentsByEvaluatorAndSchedule controller > service response: ${result.Error ? `error: ${result.message}` : `students_count: ${result.payload.length}`}}`);
        return result;
    }

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles('EVALUATOR')
    // @Get('findbyevaluator/:psId/:evaluatorId')
    // @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    // @ApiResponse({ status: 403, description: 'Forbidden.' })
    // async findAllByEvaluator(@Request() req, @Param('psId', ParseIntPipe) psId: number, @Param('evaluatorId', ParseIntPipe) evaluatorId: number) {
    //     logger.debug(`reqUser:${req.user.username} EvaluatorStudent findAllByEvaluator is calling with params psId:${psId},evaluatorId:${evaluatorId}`);
    //     const result = await this.evaluatorStudentService.findAllByEvaluator(req.user.username, psId, evaluatorId);
    //     logger.debug(`reqUser:${req.user.username} return in EvaluatorStudent findAllByEvaluator controller > service response: ${result.Error ? `error: ${result.message}` : `students_count_with_evaluaton: ${result.payload.length}`}}`);
    //     return result;
    // }
}
