import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { CoordinatorMaster } from './coordinator-master.entity';
import { Repository } from 'typeorm';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { CoordinatorMasterDto, CoordinatorUpdateDto } from './dto/coordinatormaster.dto';
import { UserMasterDto } from 'src/usermaster/dto/user-master.dto';
import logger from 'src/loggerfile/logger';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { RType } from 'src/enums';
import { RESPONSE_MESSAGE } from 'src/constants';

@Injectable()
export class CoordinatorMasterService {
  private filepath: string;
  constructor(
    @InjectRepository(CoordinatorMaster)
    private readonly coordinatorMasterRepository: Repository<CoordinatorMaster>,
    private readonly userMasterService: UserMasterService,
  ) {
    this.filepath = path.basename(__filename);
  }
  async create(reqUsername: string, coordinatorMasterDto: CoordinatorMasterDto) {
    try {
      logger.debug(`reqUser: ${reqUsername} coordinatormaster create started`);

      const userMasterDto = new UserMasterDto()
      userMasterDto.password = coordinatorMasterDto.password;
      userMasterDto.username = coordinatorMasterDto.username.trim();
      userMasterDto.role = RType.COORDINATOR;

      logger.debug(`reqUser: ${reqUsername} coordinatorcreate usermaster calling`);
      const user = await this.userMasterService.create(reqUsername, userMasterDto);
      logger.debug(`reqUser: ${reqUsername} return from usermaster > ${JSON.stringify(user)}`)

      if (user.Error)
        throw user.message;

      const coordinatorMaster = new CoordinatorMaster();
      coordinatorMaster.name = coordinatorMasterDto.name.trim();
      coordinatorMaster.updatedby = reqUsername;
      coordinatorMaster.usermaster = { id: user.payload.id } as UserMaster;
      await this.coordinatorMasterRepository.save(coordinatorMaster);

      logger.debug(`reqUser: ${reqUsername} > coordinator create & returned`);
      return { Error: false, message:  RESPONSE_MESSAGE.CREATE_ASSIGNED_SUCCESSFULLY };
    } catch (error) {
      const err_message = (typeof error == 'object' ? error.message : error);
      logger.error(`${this.filepath} > ${err_message} > in create coordinatormaster`);
      return { Error: true, message: err_message };
    }
  }

  async findAll(reqUsername: string) {
    try {
      logger.debug(`reqUser: ${reqUsername} coordinatormaster findAll started`)
      const result = await this.coordinatorMasterRepository.find({
        select: { id: true, name: true,updatedby:true, usermaster: { username: true } },
        relations: { usermaster: true }
      });
      logger.debug(`reqUser: ${reqUsername} > returned`);
      return { Error: false, payload: result };
    } catch (error) {
      const err_message = (typeof error == 'object' ? error.message : error);
      logger.error(`reqUser: ${reqUsername} > ${err_message} > in findAll coordinatormaster`);
      return { Error: true, message: err_message };
    }
  }

  async update(reqUsername: string, coordinatorUpdateDto: CoordinatorUpdateDto) {
    try {
      logger.debug(`reqUser: ${reqUsername} coordinatormaster update started`);
      const coordinatorMaster = await this.coordinatorMasterRepository.findOne({ where: { id: coordinatorUpdateDto.coordinatorId } });
      if(coordinatorMaster == null)
        throw "Coordinator not found"
      coordinatorMaster.name = coordinatorUpdateDto.name;
      coordinatorMaster.updatedby = reqUsername;
      await this.coordinatorMasterRepository.save(coordinatorMaster);
      logger.debug(`reqUser: ${reqUsername} > mentor updated & returned`);
      return { Error: false, message:RESPONSE_MESSAGE.UPDATED};
    } catch (error) {
      const err_message = (typeof error == 'object' ? error.message : error);
      logger.error(`reqUser: ${reqUsername} > ${err_message} > in update coordinatormaster`);
      return { Error: true, message: err_message };
    }
  }
}
