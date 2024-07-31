import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MilestoneStudentPsService } from './milestonestudentps.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import logger from 'src/loggerfile/logger';
import { AddCommentsByMentor, AddMakrsToMilestoneByMentor, MilestoneStudentPsCreateOrUpdateDto } from './dto/milestonestudentps.dto';

@ApiTags('milestonestudentps')
@ApiSecurity("JWT-auth")
@Controller('milestonestudentps')
export class MilestoneStudentPsController {
    constructor(private readonly mileStoneStudentPsService: MilestoneStudentPsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Post('createorupdate')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async createOrUpdate(@Request() req, @Body() milestoneStudentPsCreateOrUpdateDto: MilestoneStudentPsCreateOrUpdateDto) {
        logger.debug(`requser: ${req.user.username} milestonestudentps createOrUpdate is calling with body:${JSON.stringify(milestoneStudentPsCreateOrUpdateDto)}`);
        const result = await this.mileStoneStudentPsService.createOrUpdate(req.user, milestoneStudentPsCreateOrUpdateDto);
        logger.debug(`requser: ${req.user.username} return in milestonestudentps createOrUpdate controller > service response: ${result.Error ? `error:${result.message}` : `milestone ${result.message}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'ADMIN', 'MENTOR', 'EVALUATOR', 'STUDENT')
    @Get('studentps/:spsId/:psId')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findByStudent(@Request() req, @Param('spsId', ParseIntPipe) spsId: number, @Param('psId', ParseIntPipe) psId: number) {
        logger.debug(`requser: ${req.user.username} milestonestudentps findByStudent is calling with params spsId:${spsId},psId:${psId}`);
        const result = await this.mileStoneStudentPsService.findByStudent(req.user.username, spsId, psId);
        logger.debug(`requser: ${req.user.username} return in milestonestudentps findByStudent controller > service response: ${result.Error ? `error:${result.message}` : `student_milestones_count: ${result.payload.length}`}`);
        return result;
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MENTOR')
    @Put('addmarks')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async AddMarksToMilestone(@Request() req, @Body() addMakrsToMilestoneByMentor: AddMakrsToMilestoneByMentor) {
        logger.debug(`requser: ${req.user.username} milestonestudentps AddMarksToMilestone is calling with body ${JSON.stringify(addMakrsToMilestoneByMentor)}`);
        const result = await this.mileStoneStudentPsService.AddMarksToMilestone(req.user, addMakrsToMilestoneByMentor);
        logger.debug(`requser: ${req.user.username} return in milestonestudentps AddMarksToMilestone controller > service response: ${result.Error ? `error:${result.message}` : `${result.message} student milestones`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN','SUPERADMIN','MENTOR',  'EVALUATOR')
    @Put('comments')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async AddComment(@Request() req, @Body() addCommentsByMentor: AddCommentsByMentor) {
        logger.debug(`requser: ${req.user.username} milestonestudentps AddComment is calling with body ${JSON.stringify(addCommentsByMentor)}`);
        const result = await this.mileStoneStudentPsService.AddComment(req.user.username, addCommentsByMentor);
        logger.debug(`requser: ${req.user.username} return in milestonestudentps AddComment controller > service response: ${result.Error ? `error:${result.message}` : `${result.message} student milestones`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    @Put('offnotification/:id')
    @ApiResponse({ status: 201, description: 'The record updated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async ofNotification(@Request() req, @Param('id', ParseIntPipe) id: number) {
        logger.debug(`requser: ${req.user.username} milestonestudentps ofNotification is calling with param id:${id}`);
        const result = await this.mileStoneStudentPsService.ofNotification(req.user, id);
        logger.debug(`requser: ${req.user.username} return in milestonestudentps ofNotification controller > service response: ${result.Error ? `error:${result.message}` : `notification ${result.message}`}`);
        return result;
    }

    @Get('formatdata')
    async formatTheStudentsMilestoneDetails(){
        return await this.mileStoneStudentPsService.formatTheStudentsMilestoneDetails();
    }
}
