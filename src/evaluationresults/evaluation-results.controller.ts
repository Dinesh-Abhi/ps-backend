import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe, Request, Param, ParseIntPipe, Get, Put } from '@nestjs/common';
import { EvaluationResultsService } from './evaluation-results.service';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateEvaluationResultDto, CreateGroupResultDto, UpdateResultCommentDto } from './dto/evaluator-results.dto';
import logger from 'src/loggerfile/logger';

@ApiTags('evaluationresults')
@ApiSecurity("JWT-auth")

@Controller('evaluationresults')
export class EvaluationResultsController {
    constructor(private readonly evaluationResultsService: EvaluationResultsService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR')
    @Post('createindividual')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async createIndividual(@Request() req, @Body() createEvaluationResultDto: CreateEvaluationResultDto) {
        logger.debug(`reqUser: ${req.user.username} evaluationresults createIndividual is calling with body ${JSON.stringify(createEvaluationResultDto)}`);
        const result = await this.evaluationResultsService.createIndividual(req.user.username, createEvaluationResultDto);
        logger.debug(`reqUser: ${req.user.username} return in evaluationresults createIndividual controller > service response: ${(result.Error ? `error: ${result.message}` : `Evaluation Result ${result.message}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR')
    @Post('creategroup')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async createGroup(@Request() req, @Body() createGroupResultDto: CreateGroupResultDto) {
        logger.debug(`reqUser: ${req.user.username} evaluationresults createGroup is calling with body ${JSON.stringify(createGroupResultDto)}`);
        const result = await this.evaluationResultsService.createGroup(req.user.username, createGroupResultDto);
        logger.debug(`reqUser: ${req.user.username} return in evaluationresults createGroup controller > service response: ${(result.Error ? `error: ${result.message}` : `Evaluation Result ${result.message}`)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EVALUATOR')
    @Put('updatecomment')
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async updateResultComment(@Request() req, @Body() updateResultCommentDto: UpdateResultCommentDto) {
        logger.debug(`reqUser: ${req.user.username} evaluationresults updateResultComment is calling with body updateResultCommentDto: ${JSON.stringify(updateResultCommentDto)}`);
        const result = await this.evaluationResultsService.updateResultComment(req.user.username, updateResultCommentDto);
        logger.debug(`reqUser: ${req.user.username} return in evaluationresults updateResultComment controller > service response: ${(result.Error ? `error: ${result.message}` : `Evaluation Result ${result.message}`)}`);
        return result;
    }
}
