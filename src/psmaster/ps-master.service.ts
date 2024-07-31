import { Injectable } from '@nestjs/common';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { PsMaster } from './ps-master.entity';
import { InjectRepository } from '@nestjs/typeorm';
import logger from 'src/loggerfile/logger';
import { PsMasterDto, PsUpdateDto, ScheduleGroupEnrollDto, ScheduleProjectEnrollDto } from './dto/ps-master.dto';
import { College } from 'src/college/college.entity';
import { GroupFormEnum, PSSType, RType, SType } from 'src/enums';
import { CollegeService } from 'src/college/college.service';
import { StudentPs } from 'src/studentps/studentps.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { MilestoneService } from 'src/milestone/milestone.service';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';
import { ReqUserType } from 'src/all.formats';

@Injectable()
export class PsMasterService {
    constructor(
        @InjectRepository(PsMaster)
        private readonly psRepository: Repository<PsMaster>,
        @InjectRepository(ProjectMaster)
        private readonly projectMasterRepository: Repository<ProjectMaster>,
        @InjectRepository(College)
        private readonly collegeRepository: Repository<College>,
        @InjectRepository(StudentPs)
        private readonly studentPsRepository: Repository<StudentPs>,
        @InjectRepository(AdminMaster)
        private readonly adminMasterRepository: Repository<AdminMaster>,
    ) { }
    async create(reqUsername: string, psMasterDto: PsMasterDto) {
        try {
            logger.debug(`requser: ${reqUsername} PsMaster create service started`);
            // const college = await this.collegeService.findOne(reqUsername, psMasterDto.collegeId);
            // if (college.Error)
            //     throw college.message
            // if (college.payload.status == SType.INACTIVE || college.payload == null)
            //     throw `College ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`;
            const psByClg = await this.psRepository.findAndCount({
                where: {
                    college: { id: psMasterDto.collegeId, status: SType.ACTIVE },
                    status: PSSType.IN_PROGRESS,
                },
                relations: { college: true }
            });
            const psByClg_Year = await this.psRepository.findAndCount({
                where: {
                    college: { id: psMasterDto.collegeId, status: SType.ACTIVE },
                    studentyear: psMasterDto.studentyear,
                    academicyear: psMasterDto.academicyear,
                    status: PSSType.IN_PROGRESS,
                },
            });
            if (psByClg_Year[1] == 1 || psByClg[1] >= 2)
                throw ERROR_MESSAGES.MAKE_PS_INACTIVE;

            const res = await this.psRepository.findOne({
                where: {
                    academicyear: psMasterDto.academicyear,
                    semester: psMasterDto.semester,
                    studentyear: psMasterDto.studentyear,
                    college: { id: psMasterDto.collegeId }
                }
            });
            if (res) throw `PS ${ERROR_MESSAGES.ALREADY_EXISTS}`;

            const ps = new PsMaster();
            ps.semester = psMasterDto.semester;
            ps.studentyear = psMasterDto.studentyear;
            ps.college = { id: psMasterDto.collegeId } as College;
            ps.academicyear = psMasterDto.academicyear;
            ps.groupcount = psMasterDto.groupcount;
            ps.updatedBy = reqUsername;
            const newps = await this.psRepository.save(ps);
            // const milestaones = await this.mileStoneService.create(reqUsername,newps.id);
            // if(milestaones.Error){
            //     logger.error(`requser: ${reqUsername} error:${milestaones.message} > error in milestone createing service for newly created Ps`)
            // }
            logger.debug(`requser: ${reqUsername} PsMaster create service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster create service`)
            return { Error: true, message: err_message }
        }
    }

    async bulkCreate(reqUser: ReqUserType, psMasterDto: PsMasterDto[]) {
        try {
            logger.debug(`requser: ${reqUser.username} PsMaster bulk create service started`);
            const createdPsRecords = []
            for (const psDto of psMasterDto) {
                if(psDto.studentyear == 3 && psDto.semester == 'sem2'){
                    createdPsRecords.push({
                        Error: true,
                        studentyear: psDto.studentyear,
                        message: "PS cannot be created for 3rd year and sem2"
                    })
                }else{
                    const college = await this.collegeRepository.findOne({ where: { id: psDto.collegeId } });
                    if (college == null || college.status == SType.INACTIVE)
                        throw `College ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`;
                    const admin = await this.adminMasterRepository.findOne({ where: { status: SType.ACTIVE, usermaster: { id: reqUser.sub }, college: { id: psDto.collegeId } } });
                    if (admin == null) {
                        throw 'Admin not found for college'
                    }
                    const newps = await this.create(reqUser.username, psDto);
                    createdPsRecords.push({
                        Error: newps.Error,
                        studentyear: psDto.studentyear,
                        message: newps.message
                    })
                }
            }
            logger.debug(`requser: ${reqUser.username} PsMaster bulk create service completed`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED, payload: createdPsRecords };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.username} error:${err_message} > error in PsMaster bulk create service`);
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUsername: string,) {
        try {
            logger.debug(`requser: ${reqUsername} PsMaster findAll service started`);
            const ps = await this.psRepository.find({
                select: {
                    id: true, status: true, studentyear: true, academicyear: true, semester: true, createdon: true, updatedon: true,
                    group_end: true, group_start: true, project_end: true, project_start: true, last_updatedon_gschedule: true, last_updatedon_pschedule: true, group_scheduled_by: true, project_scheduled_by: true,
                    groupcount: true,
                    college: { id: true, code: true }
                },
                relations: { college: true }
            });
            logger.debug(`requser: ${reqUsername} PsMaster findAll service returned`);
            return { Error: false, payload: ps }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster findAll service`)
            return { Error: true, message: err_message };
        }
    }

    async findAllByCollege(reqUser: ReqUserType, collegeId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} PsMaster findAllByCollege service started`);
            if (reqUser.role == RType.ADMIN) {
                const admin = await this.psRepository.findOne({ where: { college: { id: collegeId, adminmaster: { usermaster: { id: reqUser.sub } } } } });
                if (admin == null)
                    throw "Admin not found for college"
            }
            let ps = await this.psRepository.find({
                where: { college: { id: collegeId } },
                relations: { college: true },
                select: { id: true, academicyear: true, studentyear: true, semester: true, updatedon: true, status: true, group_start: true, group_end: true, project_end: true, project_start: true, last_updatedon_gschedule: true, last_updatedon_pschedule: true, group_scheduled_by: true, project_scheduled_by: true, groupcount: true }
            });
            logger.debug(`reqUser: ${reqUser.username} PsMaster findAllByCollege service returned`);
            return { Error: false, payload: ps }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.username} error: ${err_message} > error in PsMaster findAllByCollege service`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUsername: string, psUpdateDto: PsUpdateDto) {
        try {
            logger.debug(`requser: ${reqUsername} PsMaster update service started`);
            const ps = await this.psRepository.findOneBy({ id: psUpdateDto.psId })
            if (ps == null || ps.status == PSSType.COMPLETED)
                throw `Project School ${ERROR_MESSAGES.NOT_EXISTS_COMPLETED}`

            const res = await this.psRepository.findOne({
                where: {
                    academicyear: psUpdateDto.academicyear,
                    semester: psUpdateDto.semester,
                    studentyear: psUpdateDto.studentyear,
                    status: PSSType.IN_PROGRESS,
                    college: { id: psUpdateDto.collegeId },
                    groupcount: psUpdateDto.groupcount,
                }
            });
            if (psUpdateDto.status == PSSType.IN_PROGRESS && res)
                throw `PS ${ERROR_MESSAGES.ALREADY_EXISTS}`;

            ps.academicyear = psUpdateDto.academicyear;
            ps.semester = psUpdateDto.semester;
            ps.studentyear = psUpdateDto.studentyear;
            ps.college = { id: psUpdateDto.collegeId } as College;
            ps.updatedBy = reqUsername;
            ps.status = psUpdateDto.status;
            ps.groupcount = psUpdateDto.groupcount;
            if (psUpdateDto.status == PSSType.COMPLETED) {
                const res = await this.makePsInActive(reqUsername, ps.id);
                if (res.Error)
                    throw res.message
            }
            await this.psRepository.save(ps);
            logger.debug(`requser: ${reqUsername} PsMaster update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster update service`)
            return { Error: true, message: err_message };
        }
    }

    async makePsInActive(reqUsername: string, psId: number) {
        try {
            logger.debug(`requser: ${reqUsername} PsMaster makePsInActive started with params psId: ${psId}`);
            await this.studentPsRepository.update({ ps: { id: psId } }, {
                status: SType.INACTIVE,
                updatedBy: reqUsername
            });
            await this.projectMasterRepository.update({ ps: { id: psId } }, {
                status: SType.INACTIVE,
                updatedby: reqUsername
            });
            logger.debug(`requser: ${reqUsername} PsMaster makePsInActive returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster makePsInActive service`)
            return { Error: true, message: err_message };
        }
    }

    async getAcademicYears(reqUsername: string) {
        try {
            logger.debug(`requser: ${reqUsername} psmaster getAcademicYears service started`);
            const result = await this.psRepository
                .createQueryBuilder("ps")
                .select("DISTINCT ps.academicyear", "academicyear")
                .getRawMany();
            logger.debug(`requser: ${reqUsername} psmaster getAcademicYears service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster getAcademicYears service`)
            return { Error: true, message: err_message };
        }
    }

    async getStudentLatestPs(reqUser: ReqUserType, studentId: number) {
        try {
            logger.debug(`requser: ${reqUser.sub} psmaster getStudentLatestPs service started`);
            const result = await this.psRepository.findOne({
                where: {
                    studentps: {
                        status: SType.ACTIVE,
                        student: { id: studentId, usermaster: { id: reqUser.sub } }
                    },
                },
                select: { id: true, academicyear: true, studentyear: true, semester: true, status: true },
                order: { academicyear: 'DESC', }
            })
            logger.debug(`requser: ${reqUser.sub} psmaster getStudentLatestPs service returned`);
            if (result == undefined || result == null)
                return { Error: false, message: "No Project School found for student" };
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.sub} error:${err_message} > error in PsMaster getStudentLatestPs service`)
            return { Error: true, message: err_message };
        }
    }

    async findAllWorkingPs(reqUsername: string) {
        try {
            logger.debug(`requser: ${reqUsername} psmaster findAllWorkingPs service started`);
            const current_pss = await this.psRepository.find({
                where: { status: PSSType.IN_PROGRESS }
            })
            const pss: any[] = [];
            current_pss?.map((ps) => pss.push(ps.id));
            logger.debug(`requser: ${reqUsername} psmaster findAllWorkingPs service returned`);
            return { Error: false, payload: pss };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${(typeof error == 'object' ? error.message : error)} > error in PsMaster findAllWorkingPs service`)
            return { Error: true, message: typeof error == "object" ? error.message : error };
        }
    }

    async getPsStudents(reqUsername: string, psId: number) {
        try {
            logger.debug(`requser: ${reqUsername} psmaster getPsStudents service started`);
            const students = await this.psRepository.find({
                where: {
                    id: psId, status: PSSType.IN_PROGRESS,
                    studentps: {
                        status: SType.ACTIVE, group_status: GroupFormEnum.INGROUP,
                        group: {
                            status: SType.ACTIVE,
                            project: Not(IsNull())
                        },
                        student: {
                            name: Not(Like(`VIRTUALSTUDENT%`))
                        }
                    }
                },
                relations: { studentps: true },
                select: { id: true, studentps: { id: true } },
            })
            logger.debug(`requser: ${reqUsername} psmaster getPsStudents service returned`);
            return { Error: false, payload: students };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster getPsStudents service`)
            return { Error: true, message: err_message };
        }
    }

    async scheduleGroupEnrollments(reqUsername: string, scheduleGroupEnrollDto: ScheduleGroupEnrollDto) {
        try {
            logger.debug(`requser: ${reqUsername} psmaster scheduleGroupEnrollments service started`);
            const ps = await this.psRepository.findOneBy({ id: scheduleGroupEnrollDto.psId });
            if (ps == null)
                throw ERROR_MESSAGES.NOT_FOUND;
            await this.psRepository.update({ id: scheduleGroupEnrollDto.psId }, {
                group_scheduled_by: reqUsername,
                last_updatedon_gschedule: new Date(),
                group_start: scheduleGroupEnrollDto.group_start,
                group_end: scheduleGroupEnrollDto.group_end,
                updatedBy: reqUsername,
            })
            logger.debug(`requser: ${reqUsername} psmaster scheduleGroupEnrollments service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.SCHEDULED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster scheduleGroupEnrollments service`)
            return { Error: true, message: err_message };
        }
    }

    async scheduleProjectEnrollments(reqUsername: string, scheduleProjectEnrollDto: ScheduleProjectEnrollDto) {
        try {
            logger.debug(`requser: ${reqUsername} psmaster scheduleProjectEnrollments service started`);
            const ps = await this.psRepository.findOneBy({ id: scheduleProjectEnrollDto.psId });
            if (ps == null)
                throw ERROR_MESSAGES.NOT_FOUND;

            if (ps.group_start == null)
                throw "Schedule Group Enrollment First";

            if (new Date(ps.group_start).getTime() > new Date(scheduleProjectEnrollDto.project_start).getTime())
                throw "Project start date must be after group start date.";

            if (new Date(scheduleProjectEnrollDto.project_end).getTime() < new Date(ps.group_end).getTime())
                throw "Project end date must be after group end date.";

            await this.psRepository.update({ id: scheduleProjectEnrollDto.psId }, {
                project_scheduled_by: reqUsername,
                last_updatedon_pschedule: new Date(),
                project_start: scheduleProjectEnrollDto.project_start,
                project_end: scheduleProjectEnrollDto.project_end,
                updatedBy: reqUsername,
            });
            logger.debug(`requser: ${reqUsername} psmaster scheduleProjectEnrollments service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.SCHEDULED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error:${err_message} > error in PsMaster scheduleProjectEnrollments service`)
            return { Error: true, message: err_message };
        }
    }

    // async createAllMilestonesForPs(reqUsername: string) {
    //     try {
    //         logger.debug(`reqUser: ${reqUsername} psmaster createAllMilestonesForPs service started`);
    //         const ps = await this.psRepository.find({
    //             relations: { milestones: true }
    //         });
    //         const create_milestones = []
    //         for (let i = 0; i < ps.length; i++) {
    //             if (ps[i].milestones == null || ps[i].milestones.length == 0) {
    //                 const milestone = await this.mileStoneService.create(reqUsername, ps[i].id);
    //                 if (milestone.Error) {
    //                     logger.error(`reqUser: ${reqUsername} error in creating milestone for ps:${ps[i].id}`)
    //                 } else
    //                     logger.debug(`reqUser: ${reqUsername} milestones created successfully for ps: ${ps[i].id}`)
    //                 create_milestones.push({
    //                     psId:ps[i].id,
    //                     milestone_response: milestone.message
    //                 })
    //             }
    //         }
    //         if (create_milestones.length == 0) {
    //             return { Error: true, message: ERROR_MESSAGES.MILESTONES_ALREADY_EXIST }
    //         }
    //         logger.debug(`reqUser: ${reqUsername} psmaster createAllMilestonesForPs service returned and created new milestaones count: ${create_milestones.length}, for  ${JSON.stringify(create_milestones)}`);
    //         return { Error: false, message: RESPONSE_MESSAGE.MILESTONES_CREATED, payload: create_milestones.length };
    //     } catch (error) {
    //         const err_message = (typeof error == 'object' ? error.message : error);
    //         logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in psmaster createAllMilestonesForPs service`)
    //         return { Error: true, message: err_message };
    //     }
    // }
}
