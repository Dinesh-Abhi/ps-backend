import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe, Request, Get, ParseIntPipe, Param, Put } from '@nestjs/common'
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { ProjectMasterService } from './project-master.service'
import { AssignMentorDto, DummyProjectDto, EditAssignMentorDto, ProjectMasterBulkDto, UpdateProjectMasterDto } from './dto/project-master.dto'
import logger from 'src/loggerfile/logger'

@ApiTags('projectmaster')
@ApiSecurity("JWT-auth")
@Controller('projectmaster')
export class ProjectMasterController {
    constructor(private readonly projectMasterService: ProjectMasterService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Post('create')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async create(@Request() req, @Body() projectMasterBulkDto: ProjectMasterBulkDto[]) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster bulkCreate is calling with body ${JSON.stringify(projectMasterBulkDto)}`)
        const result = await this.projectMasterService.bulkCreate(req.user.username, projectMasterBulkDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster bulkCreate controller > service response: ${(result.Error ? `error: ${result.message}` : `Projects ${result.message}`)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Post('createvirtual')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async createVirtual(@Request() req, @Body() dummyProjectDto: DummyProjectDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster createVirtual is calling with body ${JSON.stringify(dummyProjectDto)}`)
        const result = await this.projectMasterService.createVirtual(req.user.username, dummyProjectDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster createVirtual controller > service response: ${(result.Error ? `error: ${result.message}` : `Project ${result.message}`)}`)
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Put('assignmentors')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async assignMentors(@Request() req, @Body() assignMentorDto: AssignMentorDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster assignMentors is calling with body ${JSON.stringify(assignMentorDto)}`);
        const result = await this.projectMasterService.assignMentors(req.user.username, assignMentorDto);
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster assignMentors controller > service response: ${(result.Error ? `error: ${result.message}` : `Mentors ${result.message}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Put('editassignedmentors')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async editAssignedMentors(@Request() req, @Body() editEssignMentorDto: EditAssignMentorDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster editAssignedMentors is calling with body ${JSON.stringify(editEssignMentorDto)}`);
        const result = await this.projectMasterService.editAssignedMentors(req.user.username, editEssignMentorDto);
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster editAssignedMentors controller > service response: ${(result.Error ? `error: ${result.message}` : `Mentor ${result.message}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('college/:clgId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAllBycollege(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
        logger.debug(`requser: ${req.user.username} ProjectMaster findAllBycollege is calling with params clgId:${clgId}`);
        const result = await this.projectMasterService.findAllBycollege(req.user, clgId, "MANAGE");
        logger.debug(`requser: ${req.user.username} return in ProjectMaster findAllBycollege controller > service response: ${(result.Error ? `error: ${result.message}` : `projects_count: ${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Get('projectsmentors/:psId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getProjectsAndItsMentorsByPs(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster getProjectsAndItsMentorsByPs is calling with params psId:${psId}`);
        const result = await this.projectMasterService.getProjectsAndItsMentorsByPs(req.user, psId);
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster getProjectsAndItsMentorsByPs controller > service response: ${(result.Error ? `error: ${result.message}` : `projects_count: ${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @Get('projectsmentors')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getProjectsAndItsMentors(@Request() req) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster getProjectsAndItsMentors is calling`);
        const result = await this.projectMasterService.getProjectsAndItsMentors(req.user.username);
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster getProjectsAndItsMentors controller > service response: ${(result.Error ? `error: ${result.message}` : `projects_count: ${result.payload.length}`)}`);
        return result;
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @Get('')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(@Request() req) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster findAll is calling`);
        const result = await this.projectMasterService.findAll(req.user.username);
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster findAll controller > service response: ${(result.Error ? `error: ${result.message}` : `projects_count: ${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN', 'STUDENT')
    @Get('ps/:psId')
    @ApiResponse({ status: 201, description: 'The record has been successfully created fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getActiveProjectListByPs(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
        console.log(req?.headers['user-agent'])
        logger.debug(`reqUser: ${req.user.username} ProjectMaster getActiveProjectListByPs is calling with params psId:${psId}`)
        const result = await this.projectMasterService.getActiveProjectListByPs(req.user, psId)
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster getActiveProjectListByPs controller > service response: ${(result.Error ? `error: ${result.message}` : `project_count: ${result.payload.length}`)}`);
        return result
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record has been successfully created updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() updateProjectMasterDto: UpdateProjectMasterDto) {
        logger.debug(`reqUser: ${req.user.username} ProjectMaster update is calling with body ${JSON.stringify(updateProjectMasterDto)}`)
        const result = await this.projectMasterService.update(req.user.username, updateProjectMasterDto)
        logger.debug(`reqUser: ${req.user.username} return in ProjectMaster update controller > service response: ${(result.Error ? `error: ${result.message}` : `project ${result.message}`)}`)
        return result
    }
}
