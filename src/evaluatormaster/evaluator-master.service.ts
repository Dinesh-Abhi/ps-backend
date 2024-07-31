import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluatorMaster } from './evaluator-master.entity';
import { UserMasterDto } from 'src/usermaster/dto/user-master.dto';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { EvaluatorMasterDto, EvaluatorUpdateDto } from './dto/evaluator-master.dto';
import logger from 'src/loggerfile/logger';
import { RType } from 'src/enums';
import { RESPONSE_MESSAGE } from 'src/constants';

@Injectable()
export class EvaluatorMasterService {
    constructor(
        @InjectRepository(EvaluatorMaster)
        private readonly evaluatorMasterRepository: Repository<EvaluatorMaster>,
        private readonly userMasterService: UserMasterService,
    ) { }

    async bulkCreate(reqUsername: string, evaluatorMasterDto: EvaluatorMasterDto[]) {
        try {
            logger.debug(`reqUser:${reqUsername} EvaluatorMaster bulkCreate service started`);
            let updateCount = 0;
            let insertedCount = 0;
            const dupObj = [];
            for (let i = 0; i < evaluatorMasterDto.length; i++) {
                let evaluator: any = await this.evaluatorMasterRepository.findOne({
                    where: {
                        name: evaluatorMasterDto[i].name,
                        usermaster: {
                            username: evaluatorMasterDto[i].username
                        }
                    }
                });
                if (evaluator != null) {
                    updateCount++
                    evaluator.name = evaluatorMasterDto[i].name;
                    evaluator.updatedby = reqUsername;
                    await this.evaluatorMasterRepository.save(evaluator);
                    logger.debug(`reqUser:${reqUsername} evaluator user already exists in database with username: ${evaluatorMasterDto[i].username}. so, we updated user`);
                } else {
                    insertedCount++
                    const userMasterDto = new UserMasterDto();
                    userMasterDto.password = evaluatorMasterDto[i].password;
                    userMasterDto.username = evaluatorMasterDto[i].username;
                    userMasterDto.role = RType.EVALUATOR;
                    logger.debug(`reqUser:${reqUsername} calling usermaster create service`);
                    const user = await this.userMasterService.create(reqUsername, userMasterDto);
                    logger.debug(`reqUser:${reqUsername} return from usermaster create service > ${user.Error ? user.message : RESPONSE_MESSAGE.CREATED}`)
                    if (user.Error) {
                        logger.debug(`reqUser:${reqUsername} error in create user:${evaluatorMasterDto[i].username} in usermaster and user added in dublicate list`)
                        dupObj.push(evaluatorMasterDto[i].username)
                        continue;
                    }
                    evaluator = new EvaluatorMaster();
                    evaluator.name = evaluatorMasterDto[i].name;
                    evaluator.usermaster = { id: user.payload.id } as UserMaster;
                    evaluator.updatedby = reqUsername;
                    await this.evaluatorMasterRepository.save(evaluator);
                    logger.debug(`reqUser:${reqUsername} evaluator user not exists in database with username: ${evaluatorMasterDto[i].username}. so, we created user`);
                }
            }
            logger.debug(`reqUser:${reqUsername} EvaluatorMaster bulkCreate service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED, payload: { dupObj: dupObj, insertedCount: insertedCount, updateCount: updateCount } };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error:${err_message} > error in evaluatorMaster bulkCreate service`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUsername: string, evaluatorUpdateDto: EvaluatorUpdateDto) {
        try {
            logger.debug(`reqUser:${reqUsername} evaluatormaster update service started`)
            const result = await this.evaluatorMasterRepository.update({ id: evaluatorUpdateDto.evaluatorId }, {
                name: evaluatorUpdateDto.name,
                status:evaluatorUpdateDto.status,
                updatedby: reqUsername
            });
            logger.debug(`reqUser:${reqUsername} evaluatormaster update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in evaluatormaster update service`);
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUsername: string) {
        try {
            logger.debug(`reqUser:${reqUsername} evaluatormaster findAll service started`)
            const result = await this.evaluatorMasterRepository.find({
                select: { id: true, name: true, status: true, updatedby: true, usermaster: { id: true, username: true } },
                relations: { usermaster: true }
            });
            logger.debug(`reqUser:${reqUsername} evaluatormaster findAll service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in evaluatormaster findAll service`);
            return { Error: true, message: err_message };
        }
    }
}
