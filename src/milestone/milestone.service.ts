import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Milestone } from './milestone.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MilestoneUpdateDto, MilestoneCreateDto } from './dto/milestone.dto';
import logger from 'src/loggerfile/logger';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { RType } from 'src/enums';
import { ReqUserType } from 'src/all.formats';
@Injectable()
export class MilestoneService {
    constructor(
        @InjectRepository(Milestone)
        private readonly mileStoneRepository: Repository<Milestone>,
        @InjectRepository(PsMaster)
        private readonly psMasterRepository: Repository<PsMaster>,
    ) { }

    // async create(reqUsername: string, psId: number) {
    //     try {
    //         logger.debug(`reqUser: ${reqUsername} milestone create service started with arguments: psId:${psId}`);
    //         const ps = await this.psMasterRepository.findOneBy({ id: psId });
    //         if (ps == null)
    //             throw ERROR_MESSAGES.PS_NOT_FOUND;

    //         if (process.env.NOOFMILESTONES == undefined) {
    //             console.log("please define \"NOOFMILESTONES\" in environmental variables if not default it will take 5")
    //             logger.error("please define \"NOOFMILESTONES\" in environmental variables if not default it will take 5")
    //         }
    //         const milestones = await this.mileStoneRepository.find({ where: { ps: { id: ps.id } } })
    //         if (milestones.length != 0) {
    //             logger.debug(`reqUser:${reqUsername} milestones already exists for requested project: ${psId},milestones: ${JSON.stringify(milestones)}`)
    //             throw ERROR_MESSAGES.MILESTONE_ALREADY_EXIST;
    //         }
    //         logger.debug(`reqUser:${reqUsername} milestones not exists for requested psId: ${psId}`)
    //         const noof_milestones = parseInt(process.env.NOOFMILESTONES) || 5;
    //         for (let i = 0; i < noof_milestones; i++) {
    //             const milestone = new Milestone();
    //             milestone.name = `MS-${i + 1}`;
    //             milestone.ps = { id: ps.id } as PsMaster;
    //             milestone.createdby = reqUsername;
    //             milestone.updatedby = reqUsername;
    //             await this.mileStoneRepository.save(milestone);
    //         }
    //         logger.debug(`reqUser: ${reqUsername} milestone create service returned`);
    //         return { Error: false, message: RESPONSE_MESSAGE.CREATED };
    //     } catch (error) {
    //         const err_message = (typeof error == 'object' ? error.message : error);
    //         logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in milestone create service`);
    //         return { Error: true, message: err_message };
    //     }
    // }

    // async createmilestone(reqUsername: string, psId: number, createMilestoneDto: CreateMilestoneDto) {
    //     try {
    //         logger.debug(`reqUser: ${reqUsername} milestone create service started with arguments: psId:${psId}, milestoneData: ${JSON.stringify(createMilestoneDto)}`);
    //         const ps = await this.psMasterRepository.findOneBy({ id: psId });
    //         if (!ps) throw new Error(ERROR_MESSAGES.PS_NOT_FOUND);

    //         const existingMilestones = await this.mileStoneRepository.find({ 
    //             where: { 
    //                 ps: { id: ps.id },
    //                 name: createMilestoneDto.name,
    //                 type: createMilestoneDto.type 
    //             } 
    //         });
    //         console.log("existingMilestones",existingMilestones)

    //         if (existingMilestones.length !== 0) {
    //             logger.debug(`reqUser:${reqUsername} milestones already exist for requested project: ${psId}, milestones: ${JSON.stringify(existingMilestones)}`);
    //             throw new Error(ERROR_MESSAGES.MILESTONE_ALREADY_EXIST);
    //         }

    //         logger.debug(`reqUser:${reqUsername} milestones do not exist for requested psId: ${psId}`);

    //         const milestone = new Milestone();
    //         milestone.name = createMilestoneDto.name;
    //         milestone.type = createMilestoneDto.type;
    //         milestone.ps = { id: ps.id } as PsMaster;
    //         milestone.createdby = reqUsername;
    //         milestone.updatedby = reqUsername;
    //         await this.mileStoneRepository.save(milestone);

    //         logger.debug(`reqUser: ${reqUsername} milestone create service returned`);
    //         return { Error: false, message: RESPONSE_MESSAGE.CREATED };
    //     } catch (error) {
    //         const err_message = (typeof error === 'object' ? error.message : error);
    //         logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in milestone create service`);
    //         return { Error: true, message: err_message };
    //     }
    // }

    async createmilestone(requser: ReqUserType, milestoneCreateDto: MilestoneCreateDto) {
        try {
            logger.debug(`reqUser: ${requser.username} milestone create service started`);
            let ps: any
            if (requser.role == RType.ADMIN) {
                ps = await this.psMasterRepository.findOneBy({ id: milestoneCreateDto.psId, college: { adminmaster: { usermaster: { id: requser.sub } } } });
                if (ps == null)
                    throw ERROR_MESSAGES.PS_NOT_FOUND + " for admin";
            } else {
                ps = await this.psMasterRepository.findOneBy({ id: milestoneCreateDto.psId });
                if (ps == null)
                    throw new Error(ERROR_MESSAGES.PS_NOT_FOUND);
            }

            const existingMilestones = await this.mileStoneRepository.find({
                where: {
                    ps: { id: ps.id },
                    name: milestoneCreateDto.name,
                }
            });

            if (existingMilestones.length >= 2) {
                throw new Error("Maximum " + ERROR_MESSAGES.MILESTONE_ALREADY_EXIST + " for PS");
            }
            let totalWeightage = milestoneCreateDto.weightage;
            existingMilestones.forEach(milestone => {
                totalWeightage += milestone.weightage;
            });
            if (totalWeightage > 50) {
                throw new Error("All milestones weightage cannot be above 50%");
            }

            const lastdate = new Date(milestoneCreateDto.lastdate);
            lastdate.setUTCHours(0, 0, 0, 0);

            const milestone = new Milestone();
            milestone.name = milestoneCreateDto.name;
            milestone.description = milestoneCreateDto.description;
            milestone.enable = milestoneCreateDto.enable;
            milestone.enabledate = milestoneCreateDto.enable ? new Date() : null;
            milestone.lastdate = lastdate
            milestone.ps = { id: ps.id } as PsMaster;
            milestone.createdby = requser.username;
            milestone.updatedby = requser.username;
            await this.mileStoneRepository.save(milestone);

            logger.debug(`reqUser: ${requser.username} milestone create service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED };
        } catch (error) {
            const err_message = (typeof error === 'object' ? error.message : error);
            logger.error(`reqUser: ${requser.username} error: ${err_message} > error in milestone create service`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUsername: string, mileStoneUpdateDto: MilestoneUpdateDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} milestone update service started`);
            const lastdate = new Date(mileStoneUpdateDto.lastdate);
            lastdate.setUTCHours(0, 0, 0, 0);
            await this.mileStoneRepository.update({ id: mileStoneUpdateDto.id }, {
                description: mileStoneUpdateDto.description,
                lastdate: lastdate,
                enable: mileStoneUpdateDto.enable,
                enabledate: mileStoneUpdateDto.enable ? new Date() : null,
                updatedby: reqUsername,
                weightage: mileStoneUpdateDto.weightage,
            })
            logger.debug(`reqUser: ${reqUsername} milestone update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in milestone update service`);
            return { Error: true, message: err_message };
        }
    }

    async findByPs(reqUsername: string, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} milestone findByPs service started`);
            const milestones = await this.mileStoneRepository.find({
                where: { ps: { id: psId } },
                select: {
                    id: true, name: true, description: true, lastdate: true, enable: true, enabledate: true,
                    weightage: true,
                },
            })
            logger.debug(`reqUser: ${reqUsername} milestone findByPs service returned`);
            return { Error: false, payload: milestones };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in milestone findByPs service`);
            return { Error: true, message: err_message };
        }
    }

    async enableOrDisable(reqUsername: string, msId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} milestone enableOrDisable service started`);
            const milestones = await this.mileStoneRepository.findOneBy({ id: msId });
            if (milestones == null)
                throw ERROR_MESSAGES.MILESTONE_NOT_FOUND;
            if (milestones.description == null)
                throw ERROR_MESSAGES.MILESTONE_DESCRIPTION_NOT_FOUND;
            await this.mileStoneRepository.update({ id: msId }, {
                enabledate: !milestones.enable ? new Date() : null,
                enable: !milestones.enable,
                updatedby: reqUsername,
            })
            logger.debug(`milestone enableOrDisable service requested by: ${reqUsername} for milestone: ${milestones.name},msId: ${msId} changed state from enable:${milestones.enable} to enable:${milestones.enable}`);
            logger.debug(`reqUser: ${reqUsername} milestone enableOrDisable service returned`);
            if (milestones.enable)
                return { Error: false, message: RESPONSE_MESSAGE.MILESTONES_DISABLED };
            else
                return { Error: false, message: RESPONSE_MESSAGE.MILESTONES_ENABLED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in milestone enableOrDisable service`);
            return { Error: true, message: err_message };
        }
    }
}
