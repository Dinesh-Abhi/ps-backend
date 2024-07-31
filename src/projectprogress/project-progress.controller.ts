import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ProjectProgressService } from './project-progress.service';
import { Roles } from 'src/auth/roles.decorator';
import { EndorseStudentsPpDto, EvaluatorPPCreateDto, PPUpdateStudentDto, StudentPPCreateDto, UpdateCommentsPpDto } from './dto/project-progress.dto';
import logger from 'src/loggerfile/logger';

@ApiTags('project-progress')
@ApiSecurity("JWT-auth")
@Controller('project-progress')
export class ProjectProgressController {
    constructor(private readonly projectProgressService: ProjectProgressService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post('studentcreate')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async studentPPCreate(@Request() req, @Body() studentPPCreateDto: StudentPPCreateDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectProgress studentPPCreate is calling with body: ${JSON.stringify(studentPPCreateDto)}`)
        const result = await this.projectProgressService.studentPPCreate(req.user, studentPPCreateDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster getActiveProjectListByPs controller > service response: ${(result.Error ? `error: ${result.message}` : "Task " + result.message)}`)
        return result
    }

    // this controller is not using in application
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR')
    @Post('evaluatorcreate')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async evaluatoePPCreate(@Request() req, @Body() evaluatorPPCreateDto: EvaluatorPPCreateDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectProgress evaluatoePPCreate is calling with body: ${JSON.stringify(evaluatorPPCreateDto)}`)
        const result = await this.projectProgressService.evaluatoePPCreate(req.user.username, evaluatorPPCreateDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectProgress evaluatoePPCreate controller > service response: ${(result.Error ? `error: ${result.message}` : "Task " + result.message)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MENTOR')
    @Post('endorse')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async endorseStudent(@Request() req, @Body() endorseStudentsPpDto: EndorseStudentsPpDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectProgress endorseStudent is calling with body:${JSON.stringify(endorseStudentsPpDto)}`)
        const result = await this.projectProgressService.endorseStudent(req.user, endorseStudentsPpDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectProgress endorseStudent controller > service response: ${(result.Error ? `error: ${result.message}` : "Task " + result.message)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Put('studentupdate')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async studentUpdate(@Request() req, @Body() ppUpdateStudentDto: PPUpdateStudentDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectProgress studentUpdate is calling with body: ${JSON.stringify(ppUpdateStudentDto)}`)
        const result = await this.projectProgressService.studentUpdate(req.user, ppUpdateStudentDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectProgress studentUpdate controller > service response: ${(result.Error ? `error: ${result.message}` : "Task " + result.message)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR', 'MENTOR')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() updateCommentsPpDto: UpdateCommentsPpDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectProgress update is calling with body: ${JSON.stringify(updateCommentsPpDto)}`)
        const result = await this.projectProgressService.update(req.user, updateCommentsPpDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectProgress update controller > service response: ${(result.Error ? `error: ${result.message}` : `Task ${result.message}`)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR', 'MENTOR', 'STUDENT','ADMIN')
    @Get('findallpp/:spsId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAllBySPSID(@Request() req, @Param('spsId', ParseIntPipe) spsId: number) {
        logger.debug(`reqUser: ${req.user.username} ProjectProgress findAllBySPSID is calling with params spsId:${spsId}`)
        const result = await this.projectProgressService.findAllBySPSID(req.user, spsId)
        logger.debug(`reqUser: ${req.user.username} return in ProjectProgress findAllBySPSID controller > service response: ${(result.Error ? `error: ${result.message}` : `Task_count: ${result.payload.length}`)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR', 'MENTOR')
    @Get('findallbyps/:psId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAllByPs(@Request() req,@Param('psId', ParseIntPipe) psId: number) {
        logger.debug(`reqUser:${req.user.username} ProjectProgress findAllByPs is calling arguments: psId${psId}`)
        const result = await this.projectProgressService.findAllByPs(req.user,psId)
        logger.debug(`reqUser: ${req.user.username} return in ProjectProgress findAllByPs controller > service response: ${(result.Error ? `error:${result.message}` : `Tasks_count: ${result.payload.length}`)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR', 'MENTOR')
    @Get('findall')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(@Request() req) {
        logger.debug(`reqUser:${req.user.username} ProjectProgress findAll is calling`)
        const result = await this.projectProgressService.findAll(req.user)
        logger.debug(`reqUser: ${req.user.username} return in ProjectProgress findAll controller > service response: ${(result.Error ? `error:${result.message}` : `Tasks_count: ${result.payload.length}`)}`)
        return result
    }
}
