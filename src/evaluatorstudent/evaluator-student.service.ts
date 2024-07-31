import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { EvaluatorStudent } from './evaluator-student.entity';
import logger from 'src/loggerfile/logger';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { EvaluationType, SType } from 'src/enums';
import { BulkCreateEvaluatorGroupStudentDto, BulkCreateEvaluatorIndividualStudentDto, BulkUploadEvaluatorGroupWiseDto, BulkUploadEvaluatorIndividualWiseDto, CreateEvaluatorStudentDto, UpdateEvaluatorStudentTypeDto, UpdateEvaluatorToStudentDto } from './dto/evaluator-student.dto';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';

@Injectable()
export class EvaluatorStudentService {
    constructor(
        @InjectRepository(EvaluatorStudent)
        private readonly evaluatorStudentRepository: Repository<EvaluatorStudent>,
        @InjectRepository(StudentPs)
        private readonly studentPsRepository: Repository<StudentPs>,
        @InjectRepository(EvaluatorMaster)
        private readonly evaluatorMasterRepository: Repository<EvaluatorMaster>,
        @InjectRepository(EvaluationSchedule)
        private readonly evaluationscheduleRepository: Repository<EvaluationSchedule>,
        @InjectRepository(GroupMaster)
        private readonly groupMasterRepository: Repository<GroupMaster>,
    ) { }

    async bulkUploadIndividulalWise(reqUsername: string, bulkUploadEvaluatorIndividualWiseDto: BulkUploadEvaluatorIndividualWiseDto[]) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent bulkUploadIndividulalWise service started`);
            const duplicates = []
            let create_count = 0, error_count = 0;
            for (let i = 0; i < bulkUploadEvaluatorIndividualWiseDto.length; i++) {
                const individual_obj = bulkUploadEvaluatorIndividualWiseDto[i];
                const sps = await this.studentPsRepository.findOne({ where: { status: SType.ACTIVE, student: { usermaster: { username: Like(individual_obj.rollno) } } } });
                if (sps == null) {
                    duplicates.push(individual_obj);
                    continue;
                }
                const evaluator = await this.evaluatorMasterRepository.findOneBy({ status: SType.ACTIVE, usermaster: { username: Like(individual_obj.evaluatorname) } });
                if (evaluator == null) {
                    duplicates.push(individual_obj);
                    continue;
                }
                const createEvaluatorStudentDto = new CreateEvaluatorStudentDto();
                createEvaluatorStudentDto.spsIds = [sps.id];
                createEvaluatorStudentDto.groupId = sps.groupId;
                createEvaluatorStudentDto.evaluatorId = evaluator.id;
                createEvaluatorStudentDto.escheduleId = individual_obj.escheduleId;
                createEvaluatorStudentDto.type = EvaluationType.INDIVIDUALEVALUATION;
                const res = await this.createStudent(reqUsername, createEvaluatorStudentDto);
                if (res.Error)
                    duplicates.push(individual_obj);
                else {
                    create_count = create_count + res?.payload.create_count;
                    error_count = error_count + res?.payload.error_count;
                }
            }
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent bulkUploadIndividulalWise service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED, payload: { duplicates: duplicates, create_count: create_count, error_count: error_count } }
        } catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent bulkUploadIndividulalWise service`);
            return { Error: true, message: error_message };
        }
    }

    async bulkUploadGroupWise(reqUsername: string, bulkUploadEvaluatorGroupWiseDto: BulkUploadEvaluatorGroupWiseDto[]) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent bulkUploadGroupWise service started`);
            const duplicates = []
            let create_count = 0, error_count = 0;
            for (let i = 0; i < bulkUploadEvaluatorGroupWiseDto.length; i++) {
                const group_obj = bulkUploadEvaluatorGroupWiseDto[i];
                const eschedule = await this.evaluationscheduleRepository.findOneBy({ id: group_obj.escheduleId });
                if (eschedule == null) {
                    duplicates.push(group_obj);
                    continue;
                }
                const group = await this.groupMasterRepository.find({ where: { status: SType.ACTIVE, name: Like(group_obj.groupName), sps: { status: SType.ACTIVE } }, relations: { sps: true }, select: { sps: { id: true } } });
                if (group == null) {
                    duplicates.push(group_obj);
                    continue;
                }
                const evaluator = await this.evaluatorMasterRepository.findOneBy({ status: SType.ACTIVE, usermaster: { username: Like(group_obj.evaluatorname) } });
                if (evaluator == null) {
                    duplicates.push(group_obj);
                    continue;
                }
                const createEvaluatorStudentDto = new CreateEvaluatorStudentDto();
                createEvaluatorStudentDto.spsIds = group[0].sps.map(sps => sps.id);
                createEvaluatorStudentDto.groupId = group[0].id;
                createEvaluatorStudentDto.evaluatorId = evaluator.id;
                createEvaluatorStudentDto.escheduleId = group_obj.escheduleId;
                createEvaluatorStudentDto.type = EvaluationType.GROUPEVALUATION;
                const res = await this.createStudent(reqUsername, createEvaluatorStudentDto);
                if (res.Error)
                    duplicates.push(group_obj);
                else {
                    create_count = create_count + res?.payload.create_count;
                    error_count = error_count + res?.payload.error_count;
                }
            }
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent bulkUploadGroupWise service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED, payload: { duplicates: duplicates, create_count: create_count, error_count: error_count } }
        } catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent bulkUploadGroupWise service`);
            return { Error: true, message: error_message };
        }
    }

    async createIndividualStudent(reqUsername: string, bulkCreateEvaluatorIndividualStudentDto: BulkCreateEvaluatorIndividualStudentDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent createIndividualStudent service started`);
            const eschedule = await this.evaluationscheduleRepository.findOneBy({ id: bulkCreateEvaluatorIndividualStudentDto.escheduleId });
            if (eschedule == null) {
                throw "Schedule not found";
            }
            const evaluator = await this.evaluatorMasterRepository.findOneBy({ id: bulkCreateEvaluatorIndividualStudentDto.evaluatorId, status: SType.ACTIVE });
            if (evaluator == null) {
                throw "Evaluator not found";
            }
            let error_count = 0, create_count = 0
            for (let i = 0; i < bulkCreateEvaluatorIndividualStudentDto.spsIds.length; i++) {
                const spsId = bulkCreateEvaluatorIndividualStudentDto.spsIds[i];
                const sps = await this.studentPsRepository.findOne({ where: { id: spsId } });
                if (sps == null || sps.groupId == null) {
                    error_count++;
                    continue;
                }
                const createEvaluatorStudentDto = new CreateEvaluatorStudentDto();
                createEvaluatorStudentDto.spsIds = [spsId];
                createEvaluatorStudentDto.groupId = sps?.groupId;
                createEvaluatorStudentDto.evaluatorId = evaluator.id;
                createEvaluatorStudentDto.escheduleId = bulkCreateEvaluatorIndividualStudentDto.escheduleId;
                createEvaluatorStudentDto.type = EvaluationType.INDIVIDUALEVALUATION;
                const res = await this.createStudent(reqUsername, createEvaluatorStudentDto);
                if (res.Error)
                    error_count++;
                else {
                    create_count = create_count + res?.payload.create_count;
                    error_count = error_count + res?.payload.error_count;
                }
            }
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent createIndividualStudent service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED, payload: { create_count: create_count, error_count: error_count } }

        }
        catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent createIndividualStudent service`);
            return { Error: true, message: error_message };
        }
    }

    async createGroupStudent(reqUsername: string, bulkCreateEvaluatorGroupStudentDto: BulkCreateEvaluatorGroupStudentDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent createGroupStudent service started`);
            let error_count = 0, create_count = 0;
            const eschedule = await this.evaluationscheduleRepository.findOneBy({ id: bulkCreateEvaluatorGroupStudentDto.escheduleId });
            if (eschedule == null) {
                throw "Schedule not found";
            }
            const evaluator = await this.evaluatorMasterRepository.findOneBy({ status: SType.ACTIVE, id: bulkCreateEvaluatorGroupStudentDto.evaluatorId });
            if (evaluator == null) {
                throw "Evaluator not found";
            }
            for (let i = 0; i < bulkCreateEvaluatorGroupStudentDto.groupIds.length; i++) {
                const group = await this.groupMasterRepository.find({
                    where: {
                        status: SType.ACTIVE, id: bulkCreateEvaluatorGroupStudentDto.groupIds[i],
                        sps: { status: SType.ACTIVE }
                    },
                    relations: { sps: true },
                    select: { sps: { id: true } }
                });
                if (group == null) {
                    error_count++
                    continue;
                }
                const createEvaluatorStudentDto = new CreateEvaluatorStudentDto();
                createEvaluatorStudentDto.spsIds = group[0].sps.map(sps => sps.id);
                createEvaluatorStudentDto.groupId = group[0].id;
                createEvaluatorStudentDto.evaluatorId = evaluator.id;
                createEvaluatorStudentDto.escheduleId = bulkCreateEvaluatorGroupStudentDto.escheduleId;
                createEvaluatorStudentDto.type = EvaluationType.GROUPEVALUATION;
                const res = await this.createStudent(reqUsername, createEvaluatorStudentDto);
                if (res.Error)
                    error_count++;
                else {
                    create_count = create_count + res?.payload.create_count;
                    error_count = error_count + res?.payload.error_count;
                }
            }
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent createGroupStudent service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED, payload: { create_count: create_count, error_count: error_count } }

        }
        catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent createGroupStudent service`);
            return { Error: true, message: error_message };
        }
    }

    async createStudent(reqUsername: string, createEvaluatorStudentDto: CreateEvaluatorStudentDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent createStudent service started with body: ${JSON.stringify(createEvaluatorStudentDto)}`);
            let create_count = 0, error_count = 0;
            for (let i = 0; i < createEvaluatorStudentDto.spsIds.length; i++) {
                const spsId = createEvaluatorStudentDto.spsIds[i];

                let es = await this.evaluatorStudentRepository.findOneBy({ evaluationschedule: { id: createEvaluatorStudentDto.escheduleId }, studentps: { id: spsId } });
                if (es != null) {
                    error_count++;
                    continue;
                } else {
                    es = new EvaluatorStudent();
                    es.evaluationschedule = { id: createEvaluatorStudentDto.escheduleId } as EvaluationSchedule;
                    es.evaluator = { id: createEvaluatorStudentDto.evaluatorId } as EvaluatorMaster;
                    es.group = { id: createEvaluatorStudentDto.groupId } as GroupMaster;
                    es.type = createEvaluatorStudentDto.type;
                    es.updatedby = reqUsername;
                    es.studentps = { id: spsId } as StudentPs;
                    await this.evaluatorStudentRepository.save(es);
                    create_count++;
                }
            }
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent createStudent service returned `);
            return { Error: false, message: RESPONSE_MESSAGE.SCHEDULED, payload: { create_count: create_count, error_count: error_count } }
        } catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent createStudent service`);
            return { Error: true, message: error_message };
        }
    }

    async updateEvaluator(reqUsername: string, updateEvaluatorToStudentDto: UpdateEvaluatorToStudentDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent updateEvaluator service started`);
            const es = await this.evaluatorStudentRepository.findOne({
                where: { id: updateEvaluatorToStudentDto.estudentId },
                select: { id: true, type: true, group: { id: true, name: true } },
                relations: { group: true }
            });
            if (!es) {
                throw "Student " + ERROR_MESSAGES.NOT_FOUND;
            }
            const evaluator = await this.evaluatorMasterRepository.findOneBy({ id: updateEvaluatorToStudentDto.evaluatorId, status: SType.ACTIVE });
            if (evaluator == null) {
                throw "Evaluator " + ERROR_MESSAGES.NOT_EXISTS_INACTIVE;
            }
            if (es.type == EvaluationType.GROUPEVALUATION) {
                const es_students = await this.evaluatorStudentRepository.find({
                    where: { group: { id: updateEvaluatorToStudentDto.groupId }, evaluationschedule: { id: updateEvaluatorToStudentDto.evalscheduleId } }
                });
                const all_es_updates: any[] = []
                await Promise.all(es_students.map(async es => {
                    const es_student = await this.evaluatorStudentRepository.findOne({ where: { id: es.id } });
                    es_student.evaluator = { id: evaluator.id } as EvaluatorMaster;
                    es.updatedby = reqUsername;
                    all_es_updates.push(es_student);
                }));
                await this.evaluatorStudentRepository.save(all_es_updates);
            } else {
                await this.evaluatorStudentRepository.update({ id: updateEvaluatorToStudentDto.estudentId }, {
                    evaluator: { id: updateEvaluatorToStudentDto.evaluatorId } as EvaluatorMaster,
                    updatedby: reqUsername,
                })
            }
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent updateEvaluator service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent updateEvaluator service`);
            return { Error: true, message: error_message };
        }
    }

    async updateESType(reqUsername: string, updateEvaluatorStudentTypeDto: UpdateEvaluatorStudentTypeDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent updateESType service started`);
            await this.evaluatorStudentRepository.update({ id: updateEvaluatorStudentTypeDto.estudentId }, {
                type: updateEvaluatorStudentTypeDto.evaluationtype,
                updatedby: reqUsername,
            });
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent updateESType service returned `);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent updateESType service`);
            return { Error: true, message: error_message };
        }
    }

    async findStudentsBySchedule(reqUsername: string, escheduleId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent findStudentsBySchedule service started with arguments: escheduleId: ${escheduleId}`);
            const data = await this.evaluatorStudentRepository.find({
                where: { evaluationschedule: { id: escheduleId }, studentps: { status: SType.ACTIVE } },
                relations: { studentps: { group: { project: { mentors: true } }, student: { usermaster: true } }, evaluator: true, evaluationresult: true },
                select: {
                    id: true, type: true,
                    evaluator: { id: true, name: true },
                    studentps: {
                        id: true,
                        student: {
                            id: true, name: true,
                            usermaster: { id: true, username: true }
                        },
                        group: {
                            id: true, name: true,
                            project: {
                                id: true, title: true,
                                mentors: { id: true, name: true }
                            }
                        }
                    }
                }
            })
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent findStudentsBySchedule service returned`);
            return { Error: false, payload: data }
        } catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent findStudentsBySchedule service`);
            return { Error: true, message: error_message };
        }
    }

    async findStudentsByEvaluatorAndSchedule(reqUsername: string, escheduleId: number, evaluatorId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent findStudentsByEvaluatorAndSchedule service started with arguments: escheduleId: ${escheduleId}, evaluatorId:${evaluatorId}`);
            const data = await this.evaluatorStudentRepository.find({
                where: { evaluationschedule: { id: escheduleId }, evaluator: { id: evaluatorId }, studentps: { status: SType.ACTIVE } },
                relations: { studentps: { group: { project: { mentors: true } }, student: { usermaster: true } }, evaluator: true, evaluationresult: true },
                select: {
                    id: true, type: true,
                    evaluator: { id: true, name: true },
                    studentps: {
                        id: true,
                        status: true,
                        student: {
                            id: true, name: true,
                            usermaster: { id: true, username: true }
                        },
                        group: {
                            id: true, name: true,
                            project: {
                                id: true, title: true,
                                mentors: { id: true, name: true }
                            }
                        }
                    }
                }
            })
            logger.debug(`reqUser: ${reqUsername} EvaluatorStudent findStudentsByEvaluatorAndSchedule service returned`);
            return { Error: false, payload: data }
        } catch (error) {
            const error_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${error_message} > error in EvaluatorStudent findStudentsByEvaluatorAndSchedule service`);
            return { Error: true, message: error_message };
        }
    }

    // async findAllByEvaluator(reqUsername: string, psId: number, evaluatorId: number) {
    //     try {
    //         logger.debug(`reqUser: ${reqUsername} EvaluatorStudent findAllByEvaluator service started`);
    //         const data = await this.evaluatorStudentRepository.find({
    //             where: {
    //                 studentps: {
    //                     status: SType.ACTIVE,
    //                     group: {
    //                         status: SType.ACTIVE
    //                     },
    //                     ps: { id: psId }
    //                 },
    //                 evaluator: { id: evaluatorId }
    //             },
    //             select: {
    //                 id: true,
    //                 studentps: {
    //                     id: true,
    //                     group: {
    //                         id: true, name: true,
    //                         project: {
    //                             id: true, title: true,
    //                             mentors: { id: true, name: true }
    //                         }
    //                     },
    //                     student: {
    //                         id: true,
    //                         name:true,
    //                         usermaster: { id: true, username: true }
    //                     }
    //                 },
    //             },
    //             relations: { studentps: { group: { project: { mentors: true } }, student: { usermaster: true } } }
    //         });
    //         logger.debug(`reqUser: ${reqUsername} EvaluatorStudent findAllByEvaluator service returned`);
    //         return { Error: false, payload: data }
    //     } catch (error) {
    //         logger.error(`reqUser: ${reqUsername} error: ${(typeof error == 'object' ? error.message : error)} > error in EvaluatorStudent findAllByEvaluator service`);
    //         return { Error: true, message: (typeof error == 'object' ? error.message : error) };
    //     }
    // }
}
