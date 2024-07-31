import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe, Request, Put, ParseIntPipe, Param } from '@nestjs/common'
import { MentorMasterService } from './mentor-master.service'
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { MentorMasterDto, MentorProfileUpdateDto, MentorUpdateDto } from './dto/mentor-master.dto';
import logger from 'src/loggerfile/logger';

@ApiTags('mentorMaster')
@ApiSecurity("JWT-auth")
@Controller('mentormaster')
export class MentorMasterController {
    constructor(private readonly mentorMasterService: MentorMasterService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Post('create')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async create(@Request() req, @Body() mentorMasterDto: MentorMasterDto[]) {
        logger.debug(`reqUser: ${req.user.username} mentormaster create is calling with body ${JSON.stringify(mentorMasterDto)}`);
        const result = await this.mentorMasterService.create(req.user.username, mentorMasterDto);
        logger.debug(`reqUser: ${req.user.username} return in mentormaster create controller > service response: ${(result.Error ? `error: ${result.message}` : `Mentors ${result.message} and duplicates_count: ${result.payload.dupCount}, insert_count: ${result.payload.insertedCount}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Get()
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async mentorList(@Request() req,) {
        logger.debug(`reqUser: ${req.user.username} mentormaster mentorList is calling`);
        const result = await this.mentorMasterService.mentorList(req.user.username);
        logger.debug(`reqUser: ${req.user.username} return in mentormaster mentorList controller > service response: ${(result.Error ? `error: ${result.message}` : `mentors_count: ${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Get('college/:clgId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async mentorListByClg(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
        logger.debug(`reqUser: ${req.user.username} mentormaster mentorListByClg is calling with params clgId:${clgId}`);
        const result = await this.mentorMasterService.mentorListByClg(req.user.username, clgId);
        logger.debug(`reqUser: ${req.user.username} return in mentormaster mentorListByClg controller > service response: ${(result.Error ? `error: ${result.message}` : `mentors_count: ${result.payload.length}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Get('previousdata/:mentorId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getMentorPreviousData(@Request() req, @Param('mentorId', ParseIntPipe) mentorId: number) {
        logger.debug(`reqUser: ${req.user.username} mentormaster getMentorPreviousData is calling with params mentorId:${mentorId}`);
        const result = await this.mentorMasterService.getMentorPreviousData(req.user.username, mentorId);
        logger.debug(`reqUser: ${req.user.username} return in mentormaster getMentorPreviousData controller > service response: ${(result.Error ? `error: ${result.message}` : `requested date sent`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MENTOR')
    @Get('currentprojects/:mentorId')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getCurrentYearProjects(@Request() req, @Param('mentorId', ParseIntPipe) mentorId: number) {
        logger.debug(`reqUser: ${req.user.username} mentormaster getCurrentYearProjects is calling with params mentorId:${mentorId}`);
        const result = await this.mentorMasterService.getCurrentYearProjects(req.user, mentorId);
        logger.debug(`reqUser: ${req.user.username} return in mentormaster getCurrentYearProjects controller > service response: ${(result.Error ? `error: ${result.message}` : `Projects_count:${result.payload.length}`)}`)
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN','ADMIN','MENTOR')
    @Put('mentorprofileupdate')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async mentorProfileUpdate(@Request() req, @Body() mentorProfileUpdateDto: MentorProfileUpdateDto ) {
        logger.debug(`reqUser: ${req.user.username} mentormaster mentorProfileUpdate is calling with body:${JSON.stringify(mentorProfileUpdateDto)}`);
        const result = await this.mentorMasterService.mentorProfileUpdate(req.user.username, mentorProfileUpdateDto);
        logger.debug(`reqUser: ${req.user.username} return in mentormaster mentorProfileUpdate controller > service response: ${(result.Error ? `error: ${result.message}` : `service response:${result.message}`)}`)
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() mentorUpdateDto: MentorUpdateDto) {
        logger.debug(`reqUser: ${req.user.username} mentormaster update is calling with body ${JSON.stringify(mentorUpdateDto)}`)
        const result = await this.mentorMasterService.update(req.user.username, mentorUpdateDto)
        logger.debug(`reqUser: ${req.user.username} return in mentormaster update controller > service response: ${(result.Error ? `error: ${result.message}` : `Mentor ${result.message}`)}`)
        return result
    }
}
