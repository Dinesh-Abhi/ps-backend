import { Body, Controller, Get, Param, ParseIntPipe, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { GroupMasterService } from './group-master.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AssignProjectDto, EroleprojectDto, SwapProjectDto, TransferProjectDto, UpdateGroupStatusDto } from './dto/group-master.dto';
import logger from 'src/loggerfile/logger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Group Master')
@ApiSecurity("JWT-auth")
@Controller('groupmaster')
export class GroupMasterController {
  constructor(private readonly groupMasterService: GroupMasterService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('enrollproject')
  @SkipThrottle(true)
  @UsePipes(new ValidationPipe())
  async projectEnroll(@Request() req, @Body() eroleprojectDto: EroleprojectDto) {
    logger.debug(`reqUser:${req.user.username} groupmaster projectEnroll is calling with body ${JSON.stringify(eroleprojectDto)}`);
    const result = await this.groupMasterService.projectEnroll(req.user, eroleprojectDto);
    logger.debug(`reqUser:${req.user.username} return in groupmaster projectEnroll controller > service response: ${(result.Error ? `error: ${result.message}` : result.message)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('updatestatus')
  @UsePipes(new ValidationPipe())
  async updateStatus(@Request() req, @Body() updateGroupStatusDto: UpdateGroupStatusDto) {
    logger.debug(`reqUser:${req.user.username} groupmaster updateStatus is calling with body ${JSON.stringify(updateGroupStatusDto)}`);
    const result = await this.groupMasterService.updateStatus(req.user, updateGroupStatusDto);
    logger.debug(`reqUser:${req.user.username} return in groupmaster updateStatus controller > service response: ${(result.Error ? `error: ${result.message}` : `Group Status ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('assignproject')
  @UsePipes(new ValidationPipe())
  async assignProject(@Request() req, @Body() assignProjectDto: AssignProjectDto) {
    logger.debug(`reqUser:${req.user.username} groupmaster assignProject is calling with body ${JSON.stringify(assignProjectDto)}`);
    const result = await this.groupMasterService.assignProject(req.user.username, assignProjectDto);
    logger.debug(`reqUser:${req.user.username} return in groupmaster assignProject controller > service response: ${(result.Error ? `error: ${result.message}` : `Project ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('removeproject/:groupId')
  async removeProject(@Request() req, @Param('groupId', ParseIntPipe) groupId: number) {
    logger.debug(`reqUser:${req.user.username} groupmaster removeProject is calling with params groupId:${groupId}`);
    const result = await this.groupMasterService.removeProject(req.user.username, groupId);
    logger.debug(`reqUser:${req.user.username} > return in groupmaster removeProject controller > service response: ${(result.Error ? `error: ${result.message}` : `Project ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Get('ps/:psId')
  @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getGroupsByPs(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
    logger.debug(`reqUser:${req.user.username} groupmaster getGroupsByPs is calling with params psId:${psId}`);
    const result = await this.groupMasterService.getGroupsByPs(req.user.username, psId);
    logger.debug(`reqUser:${req.user.username} return in groupmaster getGroupsAndItsEvaluator controller > service response: ${(result.Error ? `error: ${result.message}` : `returned groups_count:${result.payload.length}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('swapproject')
  @UsePipes(new ValidationPipe())
  async swapProject(@Request() req, @Body() swapProjectDto: SwapProjectDto) {
    logger.debug(`reqUser:${req.user.username} groupmaster swapProject is calling with body ${JSON.stringify(swapProjectDto)}`);
    const result = await this.groupMasterService.swapProject(req.user.username, swapProjectDto);
    logger.debug(`reqUser:${req.user.username} return in groupmaster swapProject controller > service response: ${(result.Error ? `error: ${result.message}` : `Projects ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('transferproject')
  @UsePipes(new ValidationPipe())
  async transferProject(@Request() req, @Body() transferProjectDto: TransferProjectDto) {
    logger.debug(`reqUser:${req.user.username} groupmaster transferProject is calling with body ${JSON.stringify(transferProjectDto)}`);
    const result = await this.groupMasterService.transferProject(req.user.username, transferProjectDto);
    logger.debug(`reqUser:${req.user.username} return in groupmaster transferProject controller > service response: ${(result.Error ? `error: ${result.message}` : `Projects ${result.message}`)}`);
    return result;
  }
}