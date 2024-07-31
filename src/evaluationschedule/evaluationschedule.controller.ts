import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Put, ParseIntPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { EvaluationscheduleService } from './evaluationschedule.service';
import { CreateEvaluationscheduleDto, UpdateEvaluationscheduleDto } from './dto/evaluationschedule.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import logger from 'src/loggerfile/logger';

@ApiTags('Evaluation Schedule')
@ApiSecurity("JWT-auth")
@Controller('evaluationschedule')
export class EvaluationscheduleController {
  constructor(private readonly evaluationscheduleService: EvaluationscheduleService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN','ADMIN')
  @Post('create')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async create(@Request() req, @Body() createEvaluationscheduleDto: CreateEvaluationscheduleDto) {
    logger.debug(`reqUser: ${req.user.username} evaluationschedule create is calling with body ${JSON.stringify(createEvaluationscheduleDto)}`);
    const result =  await this.evaluationscheduleService.create(req.user.username, createEvaluationscheduleDto);
    logger.debug(`reqUser: ${req.user.username} return in evaluationschedule create controller > service response: ${result.Error ? `error: ${result.message}` : `Schedule ${result.message}`}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN','ADMIN')
  @Put('update')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async update(@Request() req, @Body() updateEvaluationscheduleDto: UpdateEvaluationscheduleDto) {
    logger.debug(`reqUser: ${req.user.username} evaluationschedule update is calling with body ${JSON.stringify(updateEvaluationscheduleDto)}`);
    const result =  await this.evaluationscheduleService.update(req.user.username, updateEvaluationscheduleDto);
    logger.debug(`reqUser: ${req.user.username} return in evaluationschedule update controller > service response: ${result.Error ? `error: ${result.message}` : `Schedule ${result.message}`}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN','ADMIN')
  @Get('findbyps/:psId')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findSchedulesByPS(@Request() req, @Param('psId',ParseIntPipe) psId:number) {
    logger.debug(`reqUser: ${req.user.username} evaluationschedule findSchedulesByPS is calling with params: psId: ${psId}`);
    const result =  await this.evaluationscheduleService.findSchedulesByPS(req.user.username, psId);
    logger.debug(`reqUser: ${req.user.username} return in evaluationschedule findSchedulesByPS controller > service response: ${result.Error ? `error: ${result.message}` : `Schedules_count: ${result.payload.length}`}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN','EVALUATOR')
  @Get('findallschedulesbyclg/:clgId')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAllWorkingPsSchedulesByClg(@Request() req, @Param('clgId',ParseIntPipe) clgId:number) {
    logger.debug(`reqUser: ${req.user.username} evaluationschedule findAllWorkingPsSchedulesByClg is calling`);
    const result =  await this.evaluationscheduleService.findAllWorkingPsSchedulesByClg(req.user,clgId);
    logger.debug(`reqUser: ${req.user.username} return in evaluationschedule findAllWorkingPsSchedulesByClg controller > service response: ${result.Error ? `error: ${result.message}` : `Schedules_count: ${result.payload.length}`}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN','ADMIN')
  @Get('findallworkingpsschedules')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAllWorkingPsSchedules(@Request() req) {
    logger.debug(`reqUser: ${req.user.username} evaluationschedule findAllWorkingPsSchedules is calling`);
    const result =  await this.evaluationscheduleService.findAllWorkingPsSchedules(req.user.username);
    logger.debug(`reqUser: ${req.user.username} return in evaluationschedule findAllWorkingPsSchedules controller > service response: ${result.Error ? `error: ${result.message}` : `Schedules_count: ${result.payload.length}`}`);
    return result;
  }
}
