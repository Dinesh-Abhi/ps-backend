import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { ProjectProgress } from './project-progress.entity';
import logger from 'src/loggerfile/logger';
import { EndorseStudentsPpDto, EvaluatorPPCreateDto, PPUpdateStudentDto, StudentPPCreateDto, UpdateCommentsPpDto } from './dto/project-progress.dto';
import { PSSType, RType, SType } from 'src/enums';
import { StudentPs } from 'src/studentps/studentps.entity';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { ReqUserType } from 'src/all.formats';

@Injectable()
export class ProjectProgressService {
    constructor(
        @InjectRepository(ProjectProgress)
        private readonly projectProgressRepository: Repository<ProjectProgress>,
        @InjectRepository(StudentPs)
        private readonly studentPsRepository: Repository<StudentPs>,
    ) { }

    async studentPPCreate(reqUser: ReqUserType, studentPPCreateDto: StudentPPCreateDto) {
        try {
            logger.debug(`requser: ${reqUser.username} ProjectProgress studentPPCreate service started`);
            const sps = await this.studentPsRepository.findOne({
                where: { id: studentPPCreateDto.spsId, status: SType.ACTIVE, student: { usermaster: { id: reqUser.sub } } },
                relations: { student: { usermaster: true } },
                select: { id: true, student: { id: true, usermaster: { username: true } } }
            });
            if (sps == null)
                throw `Student in Project School ${ERROR_MESSAGES.NOT_FOUND}`
            const pp = new ProjectProgress();
            pp.achievements = studentPPCreateDto.achievements;
            pp.plans = studentPPCreateDto.plans;
            pp.sps = { id: studentPPCreateDto.spsId } as StudentPs;
            pp.taskdate = new Date();
            pp.createdby = reqUser.username;
            pp.updatedby = reqUser.username;
            pp.date = new Date();
            await this.projectProgressRepository.save(pp);
            logger.debug(`requser: ${reqUser.username} ProjectProgress studentPPCreate service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.username} error: ${err_message} > error in ProjectProgress studentPPCreate service`);
            return { Error: true, message: err_message };
        }
    }

    // this service is not using in application
    async evaluatoePPCreate(reqUsername: string, evaluatoePPCreateDto: EvaluatorPPCreateDto) {
        try {
            logger.debug(`requser: ${reqUsername} ProjectProgress evaluatoePPCreate service started`);
            const sps = await this.studentPsRepository.findOneBy({ id: evaluatoePPCreateDto.spsId, status: SType.ACTIVE });
            if (sps == null)
                throw `Student ${ERROR_MESSAGES.NOT_FOUND} in Project School`
            const curr_date = new Date();
            curr_date.setUTCHours(0, 0, 0, 0);
            const pp = await this.projectProgressRepository.findOneBy({
                sps: { id: evaluatoePPCreateDto.spsId },
                createdon: MoreThanOrEqual(curr_date)
            });
            if (pp == null) {
                const createpp = new ProjectProgress();
                createpp.sps = { id: evaluatoePPCreateDto.spsId } as StudentPs;
                createpp.reviewercomments = evaluatoePPCreateDto.comments;
                createpp.reviewercommentedon = new Date();
                createpp.reviewedBy = reqUsername;
                createpp.createdby = reqUsername;
                createpp.date = new Date();
                await this.projectProgressRepository.save(createpp);
            } else {
                pp.reviewercomments = evaluatoePPCreateDto.comments;
                pp.reviewercommentedon = new Date();
                pp.reviewedBy = reqUsername;
                await this.projectProgressRepository.save(pp);
            }
            logger.debug(`requser: ${reqUsername} > ProjectProgress evaluatoePPCreate service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error: ${err_message} > error in ProjectProgress evaluatoePPCreate service`);
            return { Error: true, message: err_message };
        }
    }

    async endorseStudent(reqUser: ReqUserType, endorseStudentsPpDto: EndorseStudentsPpDto) {
        try {
            logger.debug(`requser: ${reqUser.username} ProjectProgress endorseStudent service started`);
            const pp = await this.projectProgressRepository.findOne({
                where: { id: endorseStudentsPpDto.ppId },
                relations: { sps: { student: { usermaster: true }, ps: true } },
                select: { sps: { id: true, student: { id: true, usermaster: { username: true } }, ps: { id: true } } }
            })
            if (pp == null)
                throw "Task not found"
            if (pp != null && pp.endorsed === true)
                throw ERROR_MESSAGES.ALREADY_ENDORSED;
            logger.debug(`requser: ${reqUser.username} endorseing the student: ${pp.sps.student.usermaster.username}`)
            pp.mentorcomments = endorseStudentsPpDto.comments || null;
            pp.mentorcommentedon = endorseStudentsPpDto.comments == null ? null : new Date();
            pp.endorsed = true;
            pp.endorsedon = new Date();
            pp.endorsedBy = reqUser.username;
            pp.updatedby = reqUser.username;
            await this.projectProgressRepository.save(pp);
            logger.debug(`requser: ${reqUser.username} > ProjectProgress endorseStudent service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.ENDORSED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.username} error: ${err_message} > error in ProjectProgress endorseStudent service`);
            return { Error: true, message: err_message };
        }
    }

    async studentUpdate(reqUser: ReqUserType, ppUpdateStudentDto: PPUpdateStudentDto) {
        try {
            logger.debug(`requser: ${reqUser.username} ProjectProgress studentUpdate service started`);
            const pp = await this.projectProgressRepository.findOneBy({ id: ppUpdateStudentDto.ppId, sps: { status: SType.ACTIVE, student: { usermaster: { id: reqUser.sub } } } });
            if (pp == null)
                throw `Project progress ${ERROR_MESSAGES.NOT_FOUND}`
            if (pp.endorsed == true)
                throw ERROR_MESSAGES.CANT_UPDATE_AFTER_ENDORSE
            pp.achievements = ppUpdateStudentDto.achievements;
            pp.plans = ppUpdateStudentDto.plans;
            pp.updatedby = reqUser.username;
            await this.projectProgressRepository.save(pp)
            logger.debug(`requser: ${reqUser.username} ProjectProgress studentUpdate service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.username} error: ${err_message} > error in ProjectProgress studentUpdate service`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUser: ReqUserType, updateCommentsPpDto: UpdateCommentsPpDto) {
        try {
            logger.debug(`requser: ${JSON.stringify(reqUser)} ProjectProgress update service started`);
            const pp = await this.projectProgressRepository.findOneBy({ id: updateCommentsPpDto.ppId });
            if (pp == null)
                throw `Project progress ${ERROR_MESSAGES.NOT_FOUND}`
            if (reqUser.role == RType.MENTOR) {
                pp.mentorcomments = updateCommentsPpDto.comments;
                pp.mentorcommentedon = new Date();
                pp.updatedby = reqUser.username;
            } else if (reqUser.role == RType.EVALUATOR) {
                pp.reviewercomments = updateCommentsPpDto.comments;
                pp.reviewercommentedon = new Date();
                pp.reviewedBy = reqUser.username;
                pp.updatedby = reqUser.username;
            }
            await this.projectProgressRepository.save(pp);
            logger.debug(`requser: ${reqUser.username} ProjectProgress update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.username} error: ${err_message} > error in ProjectProgress update service`);
            return { Error: true, message: err_message };
        }
    }

    async findAllBySPSID(reqUser: ReqUserType, spsId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} ProjectProgress findAllBySPSID service started`);
            //this service used get all pp created by student in that ps to show in evaluator dashboard student view
            let sps_id: any = null
            if (reqUser.role == RType.STUDENT) {
                const sps = await this.studentPsRepository.findOne({ where: { status: SType.ACTIVE, student: { usermaster: { id: reqUser.sub } } } });
                sps_id = sps?.id
            } else {
                sps_id = spsId
            }
            const pp = await this.projectProgressRepository.find({ where: { sps: { id: sps_id } }, select: { id: true, achievements: true, plans: true, reviewercomments: true, mentorcomments: true, updatedon: true, endorsedon: true, createdon: true, endorsed: true } });

            logger.debug(`reqUser: ${reqUser.username} ProjectProgress findAllBySPSID service returned`)
            return { Error: false, payload: pp };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error:  ${err_message} > error in ProjectProgress findAllBySPSID service `);
            return { Error: true, message: err_message };
        }
    }

    async findTodayPPByClgId(reqUsername: string, ClgId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectProgress findTodayPPByClgId service started`);
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const tomorrow = new Date(today.getDate() + 1);
            tomorrow.setUTCHours(0, 0, 0, 0);

            const pp = await this.projectProgressRepository.find({
                where: { sps: { createdon: Between(today, tomorrow), student: { college: { id: ClgId } } } },
                select: {
                    id: true, achievements: true, plans: true,
                    reviewercomments: true, mentorcomments: true, updatedon: true,
                    endorsedon: true, createdon: true, endorsed: true
                }
            });
            logger.debug(`reqUser: ${reqUsername} ProjectProgress findTodayPPByClgId service returned`)
            return { Error: false, payload: pp };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error:  ${err_message} > error in ProjectProgress findTodayPPByClgId service `);
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUser: ReqUserType) {
        try {
            logger.debug(`reqUser: ${JSON.stringify(reqUser)} ProjectProgress findAll service started`);
            // this service is used in evaluator and mentor dashboard
            const curr_date = new Date();
            curr_date.setUTCHours(0, 0, 0, 0);
            if (reqUser.role == RType.EVALUATOR) {
                const data = await this.projectProgressRepository.find({
                    where: { createdon: MoreThanOrEqual(curr_date) },
                    relations: { sps: true },
                    select: {
                        id: true, plans: true, achievements: true, reviewercommentedon: true, mentorcommentedon: true, reviewercomments: true, reviewedBy: true, mentorcomments: true, endorsed: true, endorsedBy: true, endorsedon: true, createdon: true,
                        sps: { id: true }
                    }
                });
                logger.debug(`reqUser: ${reqUser.username} ProjectProgress findAll service returned`);
                return { Error: false, payload: data }
            } else if (reqUser.role == RType.MENTOR) {
                let data: any = await this.projectProgressRepository.find({
                    where: { sps: { group: { project: { mentors: { usermaster: { id: reqUser.sub } } } } }, createdon: MoreThanOrEqual(curr_date) },
                    relations: { sps: true },
                    select: {
                        id: true, plans: true, achievements: true, reviewercommentedon: true, mentorcommentedon: true, reviewercomments: true, reviewedBy: true, mentorcomments: true, endorsed: true, endorsedBy: true, endorsedon: true, createdon: true,
                        sps: { id: true }
                    }
                });
                logger.debug(`reqUser: ${reqUser.username} ProjectProgress findAll service returned`);
                return { Error: false, payload: data }
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in ProjectProgress findAll service`);
            return { Error: true, message: err_message };
        }
    }

    async findAllByPs(reqUser: ReqUserType, psId: number) {
        try {
            logger.debug(`reqUser: ${JSON.stringify(reqUser)} ProjectProgress findAllByPs service started`);
            // this service is used in evaluator and mentor dashboard
            const curr_date = new Date();
            curr_date.setUTCHours(0, 0, 0, 0);
            if (reqUser.role == RType.EVALUATOR) {
                const data = await this.projectProgressRepository.find({
                    where: { sps: { ps: { id: psId } }, createdon: MoreThanOrEqual(curr_date) },
                    relations: { sps: true },
                    select: {
                        id: true, plans: true, achievements: true, reviewercommentedon: true, mentorcommentedon: true, reviewercomments: true, reviewedBy: true, mentorcomments: true, endorsed: true, endorsedBy: true, endorsedon: true, createdon: true,
                        sps: { id: true }
                    }
                });
                logger.debug(`reqUser: ${reqUser.username} ProjectProgress findAllByPs service returned`);
                return { Error: false, payload: data }
            } else if (reqUser.role == RType.MENTOR) {
                let data: any = await this.projectProgressRepository.find({
                    where: { sps: { ps: { id: psId }, group: { project: { mentors: { usermaster: { id: reqUser.sub } } } } }, createdon: MoreThanOrEqual(curr_date) },
                    relations: { sps: true },
                    select: {
                        id: true, plans: true, achievements: true, reviewercommentedon: true, mentorcommentedon: true, reviewercomments: true, reviewedBy: true, mentorcomments: true, endorsed: true, endorsedBy: true, endorsedon: true, createdon: true,
                        sps: { id: true }
                    }
                });
                logger.debug(`reqUser: ${reqUser.username} ProjectProgress findAllByPs service returned`);
                return { Error: false, payload: data }
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in ProjectProgress findAllByPs service`);
            return { Error: true, message: err_message };
        }
    }
}
