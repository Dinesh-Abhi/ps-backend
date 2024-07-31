import { Injectable } from '@nestjs/common';
import { CreateEvaluationscheduleDto, UpdateEvaluationscheduleDto } from './dto/evaluationschedule.dto';
import logger from 'src/loggerfile/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluationSchedule } from './evaluationschedule.entity';
import { Like, Repository } from 'typeorm';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { PSSType, RType } from 'src/enums';
import { ReqUserType } from 'src/all.formats';
import { College } from 'src/college/college.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Injectable()
export class EvaluationscheduleService {
  constructor(
    @InjectRepository(EvaluationSchedule)
    private readonly evaluationScheduleRepository: Repository<EvaluationSchedule>,
    @InjectRepository(AdminMaster)
    private readonly adminMasterRepository: Repository<AdminMaster>,
  ) { }
  async create(reqUsername: string, createEvaluationscheduleDto: CreateEvaluationscheduleDto) {
    try {
      logger.debug(`reqUser: ${reqUsername} Evaluationschedule create method started`)
      let schedule = await this.evaluationScheduleRepository.findOneBy({ name: Like(`${createEvaluationscheduleDto.name}%`), ps: { id: createEvaluationscheduleDto.psId } });
      if (schedule != null)
        throw `Schedule ${ERROR_MESSAGES.ALREADY_EXISTS} with given name`;
      const start_date = new Date(createEvaluationscheduleDto.start);
      start_date.setUTCHours(0, 0, 0, 0);
      const end_date = new Date(createEvaluationscheduleDto.end);
      end_date.setUTCHours(0, 0, 0, 0);

      schedule = new EvaluationSchedule();
      schedule.name = createEvaluationscheduleDto.name;
      schedule.start = start_date;
      schedule.end = end_date;
      schedule.ps = { id: createEvaluationscheduleDto.psId } as PsMaster;
      schedule.updatedby = reqUsername;
      await this.evaluationScheduleRepository.save(schedule)

      logger.debug(`reqUser: ${reqUsername} Evaluationschedule create method returned`)
      return { Error: false, message: RESPONSE_MESSAGE.CREATED };
    } catch (error) {
      const error_message = (typeof error == 'object' ? error.message : error)
      logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in Evaluationschedule create method`);
      return { Error: true, message: error_message };
    }
  }

  async update(reqUsername: string, updateEvaluationscheduleDto: UpdateEvaluationscheduleDto) {
    try {
      logger.debug(`reqUser: ${reqUsername} Evaluationschedule update method started`)
      await this.evaluationScheduleRepository.update({ id: updateEvaluationscheduleDto.id }, {
        name: updateEvaluationscheduleDto.name,
        start: updateEvaluationscheduleDto.start,
        end: updateEvaluationscheduleDto.end,
        updatedby: reqUsername,
      })
      logger.debug(`reqUser: ${reqUsername} Evaluationschedule update method returned`)
      return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
    } catch (error) {
      const error_message = (typeof error == 'object' ? error.message : error)
      logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in Evaluationschedule update method`);
      return { Error: true, message: error_message };
    }
  }

  async findSchedulesByPS(reqUser: ReqUserType, psId: number) {
    try {
      logger.debug(`reqUser: ${reqUser.username} Evaluationschedule findSchedulesByPS method started with arguments: psId:${psId}`)
      if (reqUser.role == RType.ADMIN) {
        const admin = await this.adminMasterRepository.findOne({ where: { usermaster: { id: reqUser.sub }, college: { psm: { id: psId } } } });
        if (admin == null)
          throw "Admin college and PS college is different"
      }
      const data = await this.evaluationScheduleRepository.find({ where: { ps: { id: psId } } });
      logger.debug(`reqUser: ${reqUser.username} Evaluationschedule findSchedulesByPS method returned`)
      return { Error: false, payload: data };
    } catch (error) {
      const error_message = (typeof error == 'object' ? error.message : error)
      logger.error(`reqUser: ${reqUser.username} error: ${error_message} > error in Evaluationschedule findSchedulesByPS method`);
      return { Error: true, message: error_message };
    }
  }

  async findAllWorkingPsSchedulesByClg(reqUser: ReqUserType, clgId: number) {
    try {
      logger.debug(`reqUser: ${reqUser.username} Evaluationschedule findAllWorkingPsSchedulesByClg method started`)
      if (reqUser.role == RType.ADMIN) {
        const admin = await this.adminMasterRepository.findOne({ where: { usermaster: {id : reqUser.sub }, college: { id : clgId} } });
        if (admin == null)
          throw "Admin not found for college"
      }
      const data = await this.evaluationScheduleRepository.find({
        where: {
          ps: { status: PSSType.IN_PROGRESS, college: { id: clgId } }
        },
        relations: { ps: true },
      });
      logger.debug(`reqUser: ${reqUser.username} Evaluationschedule findAllWorkingPsSchedulesByClg method returned`)
      return { Error: false, payload: data };
    } catch (error) {
      const error_message = (typeof error == 'object' ? error.message : error)
      logger.error(`reqUser: ${reqUser.username} error: ${error_message} > error in Evaluationschedule findAllWorkingPsSchedulesByClg method`);
      return { Error: true, message: error_message };
    }
  }

  async findAllWorkingPsSchedules(reqUsername: string,) {
    try {
      logger.debug(`reqUser: ${reqUsername} Evaluationschedule findAllWorkingPsSchedules method started`)
      const data = await this.evaluationScheduleRepository.find({ where: { ps: { status: PSSType.IN_PROGRESS } }, relations: { ps: true } });
      logger.debug(`reqUser: ${reqUsername} Evaluationschedule findAllWorkingPsSchedules method returned`)
      return { Error: false, payload: data };
    } catch (error) {
      const error_message = (typeof error == 'object' ? error.message : error)
      logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in Evaluationschedule findAllWorkingPsSchedules method`);
      return { Error: true, message: error_message };
    }
  }
}
