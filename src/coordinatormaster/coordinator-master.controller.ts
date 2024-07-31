import { Body, Controller, Get, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CoordinatorMasterService } from './coordinator-master.service';
import logger from 'src/loggerfile/logger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CoordinatorMasterDto, CoordinatorUpdateDto } from './dto/coordinatormaster.dto';

@ApiTags('Coordinator')
@ApiSecurity("JWT-auth")
@Controller('coordinatormaster')
export class CoordinatorMasterController {
  constructor(private readonly coordinatorMasterService: CoordinatorMasterService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('create')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async create(@Request() req, @Body() coordinatorMasterDto: CoordinatorMasterDto) {
    logger.debug(`reqUser: ${req.user.username} coordinatormaster create is calling`);
    const result = await this.coordinatorMasterService.create(req.user.username, coordinatorMasterDto);
    logger.debug(`reqUser: ${req.user.username} > return in controller > ${JSON.stringify(result)}`);
    return result;
  }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('')
    @ApiResponse({ status: 201, description: 'The record has been successfully fetched.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(@Request() req) {
        logger.debug(`reqUser: ${req.user.username} evaluatormaster evaluatorList is calling`);
        const result = await this.coordinatorMasterService.findAll(req.user.username);
        logger.debug(`reqUser: ${req.user.username} > return in controller > ${JSON.stringify(result)}`);
        return result;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Put('update')
    @ApiResponse({ status: 201, description: 'The record has been successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @UsePipes(new ValidationPipe())
    async update(@Request() req, @Body() coordinatorUpdateDto: CoordinatorUpdateDto) {
        logger.debug(`reqUser: ${req.user.username} evaluatormaster update is calling`)
        const result = await this.coordinatorMasterService.update(req.user.username, coordinatorUpdateDto)
        logger.debug(`reqUser: ${req.user.username} > return in controller > ${JSON.stringify(result)}`)
        return result
    }
}
