import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, Response, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PsMasterService } from './ps-master.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import logger from 'src/loggerfile/logger';
import { PsMasterDto, PsUpdateDto, ScheduleGroupEnrollDto, ScheduleProjectEnrollDto } from './dto/ps-master.dto';

@ApiTags('PsMaster')
@ApiSecurity("JWT-auth")
@Controller('psmaster')
export class PsMasterController {
  constructor(private readonly psMasterService: PsMasterService) { }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('SUPERADMIN', 'ADMIN')
  // @Post('create')
  // @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // @UsePipes(new ValidationPipe())
  // async create(@Request() req, @Body() psMasterDto: PsMasterDto) {
  //   logger.debug(`requser: ${req.user.username} psmaster create is calling with body ${JSON.stringify(psMasterDto)}`);
  //   const result = await this.psMasterService.create(req.user.username, psMasterDto);
  //   logger.debug(`requser: ${req.user.username} return in psmaster create controller > service response: ${(result.Error ? `error: ${result.message}` : `Ps ${result.message}`)}`);
  //   return result;
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @Post('bulkcreate')
  @ApiResponse({ status: 201, description: 'The records have been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async bulkCreate(@Request() req, @Body() psMasterDto: PsMasterDto[]) {
      logger.debug(`requser: ${req.user.username} psmaster bulkCreate is calling with body ${JSON.stringify(psMasterDto)}`);
      const result = await this.psMasterService.bulkCreate(req.user, psMasterDto);
      logger.debug(`requser: ${req.user.username} return in psmaster bulkCreate controller > service response: ${(result.Error ? `error: ${result.message}` : `Ps ${result.message}`)}`);
      return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @Put('update')
  @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async update(@Request() req, @Body() psUpdateDto: PsUpdateDto) {
    logger.debug(`requser: ${req.user.username} psmaster update is calling with body ${JSON.stringify(psUpdateDto)}`);
    const result = await this.psMasterService.update(req.user.username, psUpdateDto);
    logger.debug(`requser: ${req.user.username} return in psmaster update controller > service response: ${(result.Error ? `error: ${result.message}` : `Ps ${result.message}`)}}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('college/:clgId')
  @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAllByCollege(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
    logger.debug(`requser: ${req.user.username} psmaster findAllByCollege is calling with params collegeId:${clgId}`);
    const result = await this.psMasterService.findAllByCollege(req.user, clgId);
    logger.debug(`requser: ${req.user.username} return in psmaster findAllByCollege controller > service response: ${(result.Error ? `error: ${result.message}` : `ps_count: ${result.payload.length}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'EVALUATOR')
  @Get('')
  @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Request() req) {
    logger.debug(`requser: ${req.user.username} psmaster findAll is calling`);
    const result = await this.psMasterService.findAll(req.user.username);
    logger.debug(`requser: ${req.user.username} return in psmaster findAll controller > service response: ${(result.Error ? `error: ${result.message}` : `ps_count: ${result.payload.length}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @Get('academicyears')
  @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getAcademicYears(@Request() req) {
    logger.debug(`requser: ${req.user.username} psmaster getAcademicYears is calling`);
    const result = await this.psMasterService.getAcademicYears(req.user.username);
    logger.debug(`requser: ${req.user.username} return in psmaster getAcademicYears controller > service response: ${(result.Error ? `error: ${result.message}` : `AcademicYears_count: ${result.payload.length}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Get('studentacademicyear/:studentId')
  @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getStudentLatestAcademicYear(@Request() req, @Param('studentId', ParseIntPipe) studentId: number) {
    logger.debug(`requser: ${req.user.username} psmaster getStudentLatestAcademicYear is calling with params studentId:${studentId}`);
    const result = await this.psMasterService.getStudentLatestPs(req.user, studentId);
    logger.debug(`requser: ${req.user.username} return in psmaster getStudentLatestAcademicYear controller >  service response: ${(result.Error ? `error: ${result.message}` : `Requested data sent`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @Put('groupschedule')
  @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async scheduleGroupEnrollments(@Request() req, @Body() scheduleGroupEnrollDto: ScheduleGroupEnrollDto) {
    logger.debug(`requser: ${req.user.username} psmaster scheduleGroupEnrollments is calling with body ${JSON.stringify(scheduleGroupEnrollDto)}`);
    const result = await this.psMasterService.scheduleGroupEnrollments(req.user.username, scheduleGroupEnrollDto);
    logger.debug(`requser: ${req.user.username} return in psmaster scheduleGroupEnrollments controller > service response: ${(result.Error ? `error: ${result.message}` : `Group ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @Put('projectschedule')
  @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async scheduleProjectEnrollments(@Request() req, @Body() scheduleProjectEnrollDto: ScheduleProjectEnrollDto) {
    logger.debug(`requser: ${req.user.username} psmaster scheduleProjectEnrollments is calling with body ${JSON.stringify(scheduleProjectEnrollDto)}`);
    const result = await this.psMasterService.scheduleProjectEnrollments(req.user.username, scheduleProjectEnrollDto);
    logger.debug(`requser: ${req.user.username} return in psmaster scheduleProjectEnrollments controller > service response: ${(result.Error ? `error: ${result.message}` : `Project ${result.message}`)}`);
    return result;
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('SUPERADMIN', 'ADMIN')
  // @Post('createallmilestones')
  // @ApiResponse({ status: 201, description: 'The record has been successfully created updated.' })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async createAllMilestonesForPs(@Request() req) {
  //   logger.debug(`reqUser: ${req.user.username} ProjectMaster createAllMilestonesForPs is calling`)
  //   const result = await this.psMasterService.createAllMilestonesForPs(req.user.username)
  //   logger.debug(`reqUser: ${req.user.username} return in ProjectMaster createAllMilestonesForPs controller > service response: ${(result.Error ? `error: ${result.message}` : `Milestones ${result.message}`)}`)
  //   return result
  // }
}
