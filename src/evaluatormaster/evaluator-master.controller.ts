import { Body, Controller, Get, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import logger from 'src/loggerfile/logger';
import * as path from 'path';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { EvaluatorMasterService } from './evaluator-master.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AssignStudentsDto, BulkAssignStudentsDto, EvaluatorMasterDto, EvaluatorUpdateDto } from './dto/evaluator-master.dto';

@ApiTags('evaluatorresults')
@ApiSecurity("JWT-auth")

@Controller('evaluatormaster')
export class EvaluatorMasterController {
    private filepath: string;
    constructor(private readonly evaluatorMasterService: EvaluatorMasterService) {
        this.filepath = path.basename(__filename);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Post('create')
    @ApiResponse({ status: 201, description: 'The records has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async bulkCreate(@Request() req, @Body() evaluatorMasterDto: EvaluatorMasterDto[]) {
        logger.debug(`reqUser: ${req.user.username} evaluatormaster bulkCreate is calling with body: [${JSON.stringify(evaluatorMasterDto)}]`);
        const result = await this.evaluatorMasterService.bulkCreate(req.user.username, evaluatorMasterDto);
        logger.debug(`reqUser: ${req.user.username} return in evaluatormaster bulkCreate controller > service response: ${result.Error ? `error: ${result.message}` : `${result.message}, insert_count:${result.payload.insertedCount},update_count:${result.payload.updateCount}, duplicate_count:${result.payload.dupObj.length}, duplicates:[${result.payload.dupObj}]`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The records has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() evaluatorUpdateDto: EvaluatorUpdateDto) {
        logger.debug(`reqUser: ${req.user.username} evaluatormaster update is calling with body: [${JSON.stringify(evaluatorUpdateDto)}]`);
        const result = await this.evaluatorMasterService.update(req.user.username, evaluatorUpdateDto);
        logger.debug(`reqUser: ${req.user.username} return in evaluatormaster update controller > service response: ${result.Error ? `error: ${result.message}` : `${result.message}`}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'SUPERADMIN')
    @Get()
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(@Request() req) {
        logger.debug(`reqUser: ${req.user.username} evaluatormaster findAll is calling`);
        const result = await this.evaluatorMasterService.findAll(req.user.username);
        logger.debug(`reqUser: ${req.user.username} return in evaluatormaster findAll controller > service response: ${(result.Error ? `error: ${result.message}` : `no.of evaluators:${result.payload.length}`)}`);
        return result;
    }
}
