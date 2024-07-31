import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentPs } from './studentps.entity';
import { DataSource, In, IsNull, Like, MoreThanOrEqual, Not, Repository } from 'typeorm';
import * as path from 'path';
import logger from 'src/loggerfile/logger';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { AttendanceEnum, GroupFormEnum, PSSType, RType, SType } from 'src/enums';
import { GroupEnrollDto, SPSUpdateDto, AddNewStudentToGroupDto, ReplaceStudentInGroupDto, MentorStudentdayReportDto, SyncPastDateAttendanceDto, SyncPastDateAttendanceBetweenDatesDto, AddOrUpdateGithubLinkDto, AddReviewCommentDto, AddMentorReviewCommentDto } from './dto/student-ps.dto';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { GroupMasterService } from 'src/groupmaster/group-master.service';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { Attendance } from 'src/attendance/attendance.entity';
import * as fs from 'fs';
import { ReqUserType } from 'src/all.formats';
import { EmailService } from 'src/email/email';
import { ReviewComment } from 'src/common.interfaces ';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
const axios = require("axios");
const moment = require('moment');

@Injectable()
export class StudentPsService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(GroupMaster)
        private readonly groupRepository: Repository<GroupMaster>,
        @InjectRepository(Attendance)
        private readonly AttendanceRepository: Repository<Attendance>,
        @InjectRepository(StudentPs)
        private readonly studentPsRepository: Repository<StudentPs>,
        @InjectRepository(MentorMaster)
        private readonly mentorMasterRepository: Repository<MentorMaster>,
        @InjectRepository(PsMaster)
        private readonly psMasterRepository: Repository<PsMaster>,
        private readonly groupMasterService: GroupMasterService,
        private readonly attendanceService: AttendanceService,
        private readonly emailService: EmailService,
    ) { }
    async create(studentId: number, psId: number, reqUsername: string) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps create service started`);
            let sps: any = await this.studentPsRepository.findOne({
                where: { student: { id: studentId }, ps: { id: psId } }
            });
            if (sps)
                throw `Student in Project School ${ERROR_MESSAGES.ALREADY_EXISTS}`;
            const new_sps = new StudentPs();
            new_sps.student = { id: studentId } as StudentMaster;
            new_sps.ps = { id: psId } as PsMaster;
            new_sps.updatedBy = reqUsername;
            await this.studentPsRepository.save(new_sps);
            logger.debug(`reqUser: ${reqUsername} studentps create service returned`);
            return { Error: false, messege: RESPONSE_MESSAGE.CREATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps create service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUsername: string, spsUpdateDto: SPSUpdateDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps update service started`);
            const sps = await this.studentPsRepository.findOne({
                where: { student: { id: spsUpdateDto.studentId }, ps: { id: spsUpdateDto.old_psId } },
                relations: { group: true }
            });
            if (sps == null || sps.group != null)
                throw ERROR_MESSAGES.CANT_UPDATE
            sps.ps = { id: spsUpdateDto.new_psId } as PsMaster;
            sps.updatedBy = reqUsername;
            await this.studentPsRepository.save(sps);
            logger.debug(`reqUser: ${reqUsername} studentps update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps update service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async findStudents(reqUsername: string, psId: number) {
        try {
            //get studdents list in ps
            logger.debug(`reqUser: ${reqUsername} studentps findStudents service started`);
            const res = await this.studentPsRepository.find({
                where: { ps: { id: psId }, status: SType.ACTIVE },
                relations: { student: { usermaster: true }, group: true },
                select: {
                    id: true, group_status: true,
                    student: {
                        id: true, name: true,
                        usermaster: { username: true }
                    },
                    group: { id: true }
                }
            })
            if (res == null)
                throw `Students ${ERROR_MESSAGES.NOT_FOUND}`
            const list = []
            for (let i = 0; i < res.length; i++) {
                list.push({
                    studentId: res[i].student.id,
                    name: res[i].student.name,
                    username: res[i].student.usermaster.username,
                    group: res[i].group == null ? false : true,
                    group_status: res[i].group_status,
                })
            }
            logger.debug(`reqUser: ${reqUsername} studentps findStudents service returned`);
            return { Error: false, payload: list }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps findStudents service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getStudentDetails(reqUser: ReqUserType, studentId: number, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps getStudentDetails service started`);
            let res: any = await this.studentPsRepository.findOne({
                where: { student: { id: studentId, usermaster: { id: reqUser.sub } }, ps: { id: psId } },
                relations: {
                    ps: true,
                    student: { usermaster: true },
                    group: { project: { mentors: true } },
                    milestonestudentps: true,
                },
                select: {
                    id: true,
                    status: true,
                    student: { id: true, name: true, usermaster: { id: true, username: true } },
                    group_status: true,
                    githublink: true,
                    gitupdatedon: true,
                    reviewcomments: true,
                    mentorreviewcomments: true,
                    reviewcommentnotification: true,
                    group: {
                        id: true, name: true, createdby: true, status: true, nominee1: true, nominee2: true,
                        project: {
                            id: true, title: true, techstack: true, problemstatement: true, category: true, reflink: true,
                            mentors: { id: true, name: true },
                        },
                    },
                    ps: { id: true, group_end: true, group_start: true, project_end: true, project_start: true },
                    milestonestudentps: { id: true, notification: true },
                }
            });
            if (res == null)
                throw ERROR_MESSAGES.USER_NOT_FOUND;
            const today = new Date().getTime()
            res = {
                ...res,
                group_enroll: res?.ps?.group_start != null ? new Date(res.ps.group_start).getTime() <= today && today <= new Date(res.ps.group_end).getTime() : false,
                project_enroll: res?.ps?.project_start != null ? new Date(res.ps.project_start).getTime() <= today && today <= new Date(res.ps.project_end).getTime() : false
            }
            if (res.group_enroll) {
                res = {
                    ...res,
                    group_end: res?.ps?.group_end
                }
                if (res.project_enroll) {
                    res = {
                        ...res,
                        project_end: res?.ps?.project_end
                    }
                }
            }
            if (res != null && res.milestonestudentps != null) {
                res = {
                    ...res,
                    milestones: res?.milestonestudentps.length ?? 0,
                    milestonenotification: res?.milestonestudentps.filter((i: any) => i.notification).length ?? 0
                }
            }

            if (res != null && res.milestonestudentps != null) {
                delete res["milestonestudentps"];
            }
            if (res != null && res.ps != null) {
                delete res["ps"];
            }
            if (res != null && res?.group != null) {
                const team_members = await this.studentPsRepository.find({
                    where: { status: SType.ACTIVE, group: { id: res.group.id } },
                    select: { id: true, student: { id: true, name: true, usermaster: { id: true, username: true } } },
                    relations: { student: { usermaster: true } }
                });
                res.group = {
                    ...res.group,
                    teammembers: team_members?.map((s) => ({
                        id: s.student.id,
                        name: s.student.name,
                        username: s.student.usermaster.username,
                    })) ?? []
                };
            }
            logger.debug(`reqUser: ${reqUser.username} studentps getStudentDetails service returned`);
            return { Error: false, payload: res }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps getStudentDetails service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getPPsByStudent(reqUser: ReqUserType, studentId: number, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps getPPsByStudent service started`);
            const pp_data = await this.studentPsRepository.find({
                where: { ps: { id: psId }, student: { id: studentId, usermaster: { id: reqUser.sub } } },
                relations: { pp: true },
                select: { id: true, pp: { id: true, achievements: true, plans: true, updatedon: true, mentorcomments: true, reviewercomments: true, endorsed: true } }
            })
            logger.debug(`reqUser: ${reqUser.username} studentps getPPsByStudent service returned`);
            return { Error: false, payload: pp_data }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps getPPsByStudent service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getPastHistory(reqUser: ReqUserType, studentId: number, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps getPastHistory service started`);
            let spsId: any = null
            if (reqUser.role == RType.STUDENT) {
                const sps = await this.studentPsRepository.findOne({ where: { ps: { id: psId }, student: { id: studentId, usermaster: { id: reqUser.sub } } } });
                spsId = sps?.id
            } else if (reqUser.role == RType.MENTOR) {
                const sps = await this.studentPsRepository.findOne({
                    where: {
                        ps: {
                            id: psId,
                            projects: { mentors: { usermaster: { id: reqUser.sub } } }
                        },
                        student: { id: studentId }
                    }
                });
                spsId = sps?.id
            } else {
                const sps = await this.studentPsRepository.findOne({ where: { ps: { id: psId }, student: { id: studentId } } });
                spsId = sps?.id
            }
            if (spsId != null) {
                let past_data: any = await this.studentPsRepository.findOne({
                    where: { id: spsId },
                    relations: {
                        pp: true,
                        milestonestudentps: { milestone: true },
                        group: { project: { mentors: true } },
                        es: { evaluator: true, evaluationschedule: true, evaluationresult: true }
                    },
                    select: {
                        id: true,
                        reviewcomments: true,
                        mentorreviewcomments: true,
                        group: {
                            id: true,
                            name: true,
                            createdby: true,
                            status: true,
                            project: {
                                id: true,
                                category: true,
                                problemstatement: true,
                                title: true,
                                mentors: {
                                    id: true,
                                    name: true
                                }
                            },
                        },
                        pp: {
                            id: true, achievements: true, plans: true, updatedon: true, mentorcomments: true, reviewercomments: true
                        },
                        milestonestudentps: {
                            id: true,
                            milestonedetails: true,
                            milestone: {
                                id: true,
                                name: true,
                                enable: true,
                                lastdate: true,
                            }
                        },
                        es: {
                            id: true, type: true,
                            evaluator: { id: true, name: true },
                            evaluationschedule: { id: true, name: true }
                        }
                    }
                });
                if (past_data?.group != null) {
                    const team_members = await this.studentPsRepository.find({
                        where: { group: { id: past_data.group.id } },
                        select: { id: true, student: { id: true, name: true, usermaster: { id: true, username: true } } },
                        relations: { student: { usermaster: true } }
                    });
                    past_data = {
                        ...past_data,
                        teammembers: team_members?.map((s) => ({
                            id: s.student.id,
                            name: s.student.name,
                            username: s.student.usermaster.username,
                        })) ?? [],
                    }
                }
                logger.debug(`reqUser: ${reqUser.username} studentps getPastHistory service returned`);
                return { Error: false, payload: past_data }
            } else
                throw "Student not found";
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps getPastHistory service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async makeSPSInactiveByStudentId(reqUsername: string, studentId: number, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps makeSPSInactiveByStudentId service started`);
            await this.studentPsRepository.update({ student: { id: studentId }, ps: { id: psId } }, {
                status: SType.INACTIVE,
                updatedBy: reqUsername
            });
            logger.debug(`reqUser: ${reqUsername} studentps makeSPSInactiveByStudentId service returned`);
            return { Error: false, messege: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps makeSPSInactiveByStudentId service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async makeSPSActiveByStudentId(reqUsername: string, studentId: number, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps makeSPSActiveByStudentId service started`);
            await this.studentPsRepository.update({ student: { id: studentId }, ps: { id: psId } }, {
                status: SType.ACTIVE,
                updatedBy: reqUsername
            });
            logger.debug(`reqUser: ${reqUsername} studentps makeSPSActiveByStudentId service returned`);
            return { Error: false, messege: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps makeSPSActiveByStudentId service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async groupEnroll(reqUser: ReqUserType, groupEnrollDto: GroupEnrollDto) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            logger.debug(`${reqUser.username} studentps groupEnroll service started`);
            const ps = await this.psMasterRepository.findOneBy({ id: groupEnrollDto.psId });
            if (!ps)
                throw `Ps ${ERROR_MESSAGES.NOT_FOUND}`;
            const today = new Date().getTime();
            if (!(new Date(ps.group_start).getTime() <= today)) {
                if (!(today <= new Date(ps.group_end).getTime()))
                    throw ERROR_MESSAGES.GROUP_FORM_END;
                throw ERROR_MESSAGES.GROUP_FORM_NOT_START;
            }

            const user = await this.studentPsRepository.findOne({ where: { status: SType.ACTIVE, student: { id: In(groupEnrollDto.students), usermaster: { id: reqUser.sub } } } });
            if (user == null)
                throw "Requested user not found in given list";

            const randomDelay = () => {
                const delayMilliseconds = Math.floor(Math.random() * 10000)
                const delaySeconds = Math.floor(Math.random() * 10) + 1;
                logger.debug(`group enroll dealy:- ${reqUser.username} delay time ${delaySeconds} ${delayMilliseconds} `)
                return new Promise(resolve => setTimeout(resolve, (delaySeconds * 1000) + delayMilliseconds));
            };
            await randomDelay();
            const s_set = new Set(groupEnrollDto.students);
            if (groupEnrollDto.students.length == 0 || s_set.size != groupEnrollDto.students.length)
                throw `Students ${ERROR_MESSAGES.DUP_ENTRY}`;
            let studentps: any = await this.studentPsRepository.find({
                where: {
                    status: SType.ACTIVE,
                    ps: { id: groupEnrollDto.psId },
                    student: {
                        id: In(groupEnrollDto.students),
                        status: SType.ACTIVE,
                    },
                    group: IsNull(),
                    g_lock: IsNull(),
                    group_status: In([GroupFormEnum.NOTINGROUP, GroupFormEnum.TRYAGAIN])
                },
            });
            let sps_Ids: any = await Promise.all(studentps.map((sps: any) => sps.id));
            logger.debug(`${reqUser.username} sps_Id ${sps_Ids}`)
            if (sps_Ids.length != s_set.size)
                throw ERROR_MESSAGES.STUDENT_GROUP_EXISTS
            for (let i = 0; i < sps_Ids.length; i++) {
                const studentdir = path.join(__dirname, '../../public', 's_lock');
                await fs.promises.mkdir(studentdir, { recursive: true });
                const s_file = path.join(studentdir, `s-${sps_Ids[i]}.txt`)
                if (!fs.existsSync(s_file)) {
                    try {
                        fs.writeFile(s_file, `sId-${sps_Ids[i]} requestuser ${reqUser.username}`, (err) => {
                            if (err) throw err;
                        });
                    } catch (error) {
                        logger.error(`${reqUser.username} error in student file creating file name:- ${s_file}  error:- ${error}`)
                        throw { Error: true, message: "File already exists", file: s_file }
                    }
                } else {
                    logger.error(`${reqUser.username} student file already exists file name:- ${s_file}`)
                    throw { Error: true, message: "File already exists", file: s_file }
                }
            }
            const u = await this.studentPsRepository
                .createQueryBuilder()
                .update(StudentPs)
                .set({ group_status: GroupFormEnum.GROUPPROCESSING })
                .whereInIds(sps_Ids)
                .execute();
            logger.debug(`${reqUser.username} after state changed to groupprocessing update ${u}`)
            // let jobOptions = {
            //     attempts: 1,
            //     lifo: true,
            //     backoff: {
            //         type: 'fixed',
            //         delay: 5000,
            //     },
            //     timeout: 3000000,
            //     removeOnComplete: true,
            // }
            // let jobData = {
            //     students: groupEnrollDto.students,
            //     psId: groupEnrollDto.psId,
            //     reqUser: reqUser,
            // }
            // const job = await this.groupFormQueue.add(
            //     jobData,
            //     jobOptions
            // );
            // logger.info(`returned > ${JSON.stringify(job)}`);
            // if (job.id == null && job == null) {
            //     console.log("job failed", job.id)
            //     const u = await this.studentPsRepository
            //         .createQueryBuilder()
            //         .update(StudentPs)
            //         .set({ group_status: GroupFormEnum.TRYAGAIN })
            //         .whereInIds(sps_Ids)
            //         .execute();
            //     console.log("updated successfully", u)
            // }
            // console.log("job created successfully", job.id)
            // return { Error: false, message: RESPONSE_MESSAGE.GROUP_CREATION_PROGRESS }
            await queryRunner.startTransaction('SERIALIZABLE');
            logger.debug(`${reqUser.username} queryRunner Transaction started`)

            try {
                const c_group = new GroupMaster();
                c_group.name = null;
                c_group.nominee1 = groupEnrollDto.nominees[0];
                c_group.nominee2 = groupEnrollDto.nominees[1];
                c_group.psId = groupEnrollDto.psId;
                c_group.createdby = reqUser.username;
                c_group.updatedby = reqUser.username;
                const group = await queryRunner.manager.save(GroupMaster, c_group);
                // await queryRunner.commitTransaction();
                logger.debug(`${reqUser.username} group created  details${JSON.stringify(group)}`)
                for (let i = 0; i < studentps.length; i++) {
                    const res = await this.studentPsRepository.findOneBy({ id: studentps[i].id })
                    if (res == null || res.status == SType.INACTIVE || res.group != null || res.g_lock != null || res.group_status != GroupFormEnum.GROUPPROCESSING) {
                        logger.error(`${reqUser.username} sps error in assigning group ${JSON.stringify(res)}`)
                        throw ERROR_MESSAGES.STUDENT_GROUP_EXISTS;
                    }
                    else
                        logger.debug(`${reqUser.username}, else student not exits in group. sps: ${JSON.stringify(res)}`)
                    res.group = { id: group.id } as GroupMaster;
                    res.updatedBy = reqUser.username;
                    res.g_lock = reqUser.sub;
                    res.group_status = GroupFormEnum.INGROUP;
                    await queryRunner.manager.save(StudentPs, res);

                }
                await queryRunner.commitTransaction();
                logger.debug(`${reqUser.username} queryRunner Transaction commited`)

                await this.groupRepository.update({ id: group.id }, {
                    name: `G` + group.id,
                    updatedby: reqUser.username
                });
                logger.debug(`${reqUser.username} commeted transaction`)
                for (let i = 0; i < groupEnrollDto.students.length; i++) {
                    const studentdir = path.join(__dirname, '../../public', 's_lock');
                    const s_file = path.join(studentdir, `s-${groupEnrollDto.students[i]}.txt`)
                    if (fs.existsSync(s_file)) {
                        fs.unlink(s_file, (err) => {
                            if (err)
                                logger.error(`${reqUser.username} error in unlink file ${s_file} error: ${err} file status : ${fs.existsSync(s_file)}`)
                        })
                    }
                }
                logger.debug(`${reqUser.username} studentps groupEnroll service returned`);
                return { Error: false, message: RESPONSE_MESSAGE.GROUP_CREATED_SUCCESSFULLY }
            } catch (error) {
                logger.error(`${reqUser.username} error: ${(typeof error == 'object' ? error.message : error)} > ${reqUser.username} in transaction`)
                queryRunner != null ? await queryRunner.rollbackTransaction() : logger.error("queryRunner is null in rollback");
                logger.debug(`${reqUser.username} queryRunner Transaction rollback`)
                const u = await this.studentPsRepository
                    .createQueryBuilder()
                    .update(StudentPs)
                    .set({ group_status: GroupFormEnum.TRYAGAIN })
                    .whereInIds(sps_Ids)
                    .execute();
                throw { Error: true, message: (typeof error == 'object' ? error.message : error) };
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps groupEnroll service > ${err_message}`)
            if (error?.message == 'File already exists') {
                for (let i = 0; i < groupEnrollDto.students.length; i++) {
                    const studentdir = path.join(__dirname, '../../public', 's_lock');
                    const s_file = path.join(studentdir, `s-${groupEnrollDto.students[i]}.txt`)
                    if (fs.existsSync(s_file)) {
                        if (error.file == s_file)
                            continue;
                        fs.unlink(s_file, (err) => {
                            if (err)
                                logger.error(`reqUser: ${reqUser.username} error in unlink file ${s_file} error: ${err} file status : ${fs.existsSync(s_file)}`)
                        })
                    }
                }
            } else {
                for (let i = 0; i < groupEnrollDto.students.length; i++) {
                    const studentdir = path.join(__dirname, '../../public', 's_lock');
                    const s_file = path.join(studentdir, `s-${groupEnrollDto.students[i]}.txt`)
                    if (fs.existsSync(s_file)) {
                        fs.unlink(s_file, (err) => {
                            if (err)
                                logger.error(`reqUser: ${reqUser.username} error in unlink file ${s_file} error: ${err} file status : ${fs.existsSync(s_file)}`)
                        })
                    }
                }
            }
            return { Error: true, message: err_message };
        } finally {
            logger.debug(`${reqUser.username} end the transaction and release queryrunner`);
            queryRunner != null ? await queryRunner.release() : logger.error("queryRunner is null in realese");
        }
    }

    async findAllStudentForEvaluator(reqUsername: string, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps findAllStudentForEvaluator service started`);
            const res = await this.studentPsRepository.find({
                where: { ps: { id: psId, status: PSSType.IN_PROGRESS }, status: SType.ACTIVE },
                relations: { milestonestudentps: true, student: { college: true, usermaster: true }, ps: true, group: { project: { mentors: true } } },
                select: {
                    id: true,
                    reviewcomments: true,
                    mentorreviewcomments: true,
                    student: {
                        id: true, name: true, section: true,
                        college: { id: true, name: true, code: true },
                        usermaster: { id: true, username: true }
                    },
                    milestonestudentps: { id: true },
                    ps: { id: true, academicyear: true, studentyear: true, semester: true },
                    group: {
                        id: true, name: true,
                        createdby: true, status: true,
                        project: {
                            id: true, title: true, category: true, problemstatement: true, techstack: true, reflink: true,
                            mentors: { id: true, name: true }
                        }
                    }
                }
            });
            const final = []
            for (let i = 0; i < res.length; i++) {
                const att = await this.attendanceService.getTotalAttendance(reqUsername, res[i].id);
                if (att.Error)
                    throw att.message
                final.push({
                    spsId: res[i].id,
                    studentId: res[i].student.id,
                    studentname: res[i].student.name,
                    section: res[i].student.section,
                    username: res[i].student.usermaster.username,
                    collegeId: res[i].student.college.id,
                    collegecode: res[i].student.college.code,
                    collegename: res[i].student.college.name,
                    psId: res[i].ps.id,
                    academicyear: res[i].ps.academicyear,
                    studentYear: res[i].ps.studentyear,
                    semester: res[i].ps.semester,
                    attendance: att.payload,
                    groupId: res[i].group?.id,
                    groupname: res[i].group?.name,
                    group_createdby: res[i].group?.createdby,
                    group_status: res[i].group?.status,
                    milestonecount: res[i].milestonestudentps.length,
                    reviewcomments: res[i]?.reviewcomments,
                    mentorreviewcomments: res[i]?.mentorreviewcomments,
                    project: {
                        id: res[i].group?.project?.id,
                        problemstatement: res[i].group?.project?.problemstatement,
                        category: res[i].group?.project?.category,
                        title: res[i].group?.project?.title,
                        techstack: res[i].group?.project?.techstack,
                        reflink: res[i].group?.project?.reflink,
                        mentors: res[i].group?.project?.mentors?.map((m) => m.name)
                    }
                })
            }
            logger.debug(`reqUser: ${reqUsername} studentps findAllStudentForEvaluator service returned`);
            return { Error: false, payload: final }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps findAllStudentForEvaluator service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getMentorStudents(reqUser: ReqUserType, mentorId: number, psId: number, projectId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps getMentorStudents service started`);
            const mentor = await this.mentorMasterRepository.findOne({ where: { id: mentorId, usermaster: { id: reqUser.sub }, projects: { id: projectId, ps: { id: psId } } } })
            if (mentor == null)
                throw "Mentor not found with give details";
            const raw_data = await this.studentPsRepository.find({
                where: {
                    status: SType.ACTIVE,
                    ps: { id: psId, status: PSSType.IN_PROGRESS },
                    group: {
                        project: { id: projectId, mentors: { id: mentorId } }
                    },
                },
                relations: {
                    pp: true, group: { project: true }, student: { college: true, usermaster: true }, milestonestudentps: true,
                },
                select: {
                    id: true,
                    reviewcomments: true,
                    mentorreviewcomments: true,
                    student: {
                        id: true, name: true, section: true,
                        college: { id: true, code: true },
                        usermaster: { id: true, username: true }
                    },
                    milestonestudentps: { id: true },
                    // add milestone in the relation milestonestudentps: { id: true, milestone: { name : true , weightage : true ,  }, milestonedetails: true , marksgiven : true  },
                    group: { id: true, name: true, createdby: true, status: true, project: { id: true, techstack: true, category: true, problemstatement: true, title: true, reflink: true } },
                    pp: { id: true },
                }
            })
            const final_data = []
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            for (let i = 0; i < raw_data.length; i++) {
                const total_att = await this.attendanceService.getTotalAttendance(reqUser.username, raw_data[i].id);
                if (total_att.Error)
                    throw total_att.message
                const today_att = await this.AttendanceRepository.findOneBy({ sps: { id: raw_data[i].id }, createdon: MoreThanOrEqual(today) });
                final_data.push({
                    spsId: raw_data[i].id,
                    reviewcomments: raw_data[i].reviewcomments,
                    mentorreviewcomments: raw_data[i].mentorreviewcomments,
                    studentId: raw_data[i].student.id,
                    studentname: raw_data[i].student.name,
                    section: raw_data[i].student.section,
                    collegecode: raw_data[i].student.college.code,
                    username: raw_data[i].student.usermaster.username,
                    total_attendance: total_att.payload,
                    today_attendance: today_att != null ? today_att.attendance : null,
                    groupname: raw_data[i].group?.name,
                    group_createdby: raw_data[i].group?.createdby,
                    group_status: raw_data[i].group?.status,
                    project: {
                        title: raw_data[i].group?.project?.title,
                        problemstatement: raw_data[i].group?.project?.problemstatement,
                        category: raw_data[i].group?.project?.category,
                        techstack: raw_data[i].group?.project?.techstack,
                        reflink: raw_data[i].group?.project?.reflink,
                    },
                    milestone: raw_data[i].milestonestudentps.length,
                    tasks_count: raw_data[i].pp.length,
                })
            }
            logger.debug(`reqUser: ${reqUser.username} studentps getMentorStudents service returned`);
            return { Error: false, payload: final_data }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps findAllStudents service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getStudentAndGroup(reqUser: ReqUserType, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps getStudentAndGroup service started`);
            if (reqUser.role == RType.ADMIN) {
                const ps = await this.psMasterRepository.findOne({ where: { id: psId, college: { adminmaster: { usermaster: { id: reqUser.sub } } } } });
                if (ps == null)
                    throw "Admin not found for PS"
            }
            const sps = await this.studentPsRepository.find({
                where: { ps: { id: psId } },
                select: {
                    id: true, status: true,
                    milestonestudentps: { id: true },
                    student: { id: true, name: true, section: true, usermaster: { username: true, id: true } },
                    group: {
                        id: true, name: true, createdby: true, status: true, updatedon: true,
                        project: { id: true, title: true, mentors: { id: true, name: true } }
                    },
                    es: { id: true, evaluator: { id: true, name: true }, evaluationschedule: { id: true, name: true, start: true, end: true } }
                },
                relations: { milestonestudentps: true, student: { usermaster: true }, group: { project: { mentors: true } }, es: { evaluationresult: true, evaluationschedule: true, evaluator: true } }
            });
            const list = []
            for (let i = 0; i < sps.length; i++) {
                if (sps[i].group != null) {
                    list.push({
                        spsId: sps[i].id,
                        studentId: sps[i].student.id,
                        studentName: sps[i].student.name,
                        section: sps[i].student.section,
                        sps_status: sps[i].status,
                        username: sps[i].student.usermaster.username,
                        groupId: sps[i].group.id,
                        groupName: sps[i].group.name,
                        group_createdby: sps[i].group.createdby,
                        group_status: sps[i].group.status,
                        groupupdatedon: sps[i].group.updatedon,
                        projectId: sps[i].group.project?.id,
                        project: sps[i].group.project?.title,
                        mentors: sps[i].group.project?.mentors?.map((mentor) => mentor.name),
                        milestone: sps[i].milestonestudentps.length,
                        evaluation_student: sps[i].es,
                    })
                }
            }
            logger.debug(`reqUser: ${reqUser.username} studentps getStudentAndGroup returned`);
            return { Error: false, payload: list }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps getStudentAndGroup service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getGroup(reqUsername: string, clgId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps getGroup service started`);
            const sps = await this.studentPsRepository.find({
                where: { ps: { college: { id: clgId } } },
                select: { group: { id: true, name: true, createdby: true, status: true }, ps: { id: true, academicyear: true, studentyear: true, semester: true } },
                relations: { group: true, ps: true }
            });
            const list = []
            for (let i = 0; i < sps.length; i++) {
                list.push({
                    groupId: sps[i].group.id,
                    groupName: sps[i].group.name,
                    group_createdBy: sps[i].group.createdby,
                    group_status: sps[i].group.status,
                    psId: sps[i].ps.id,
                    academicyear: sps[i].ps.academicyear,
                    studentyear: sps[i].ps.studentyear,
                    semester: sps[i].ps.semester,
                })
            }
            logger.debug(`reqUser: ${reqUsername} studentps getGroup service returned`);
            return { Error: false, payload: list }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps getGroup service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async studentChangeGroup(requser: ReqUserType, spsId: number, groupId: number) {
        try {
            logger.debug(`reqUser: ${requser.username} studentps studentChangeGroup service started`);
            const sps = await this.studentPsRepository.findOne({
                where: { id: spsId, status: SType.ACTIVE },
                relations: { group: true }
            });
            if (sps == null)
                throw `Student ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`
            const group = await this.groupMasterService.findOne(requser.username, groupId);
            if (group.Error)
                throw group.message
            if (group.payload == null || group.payload.status == SType.INACTIVE)
                throw `Group ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`
            sps.group = { id: group.payload.id } as GroupMaster;
            sps.group_status = GroupFormEnum.INGROUP;
            sps.g_lock = requser.sub;
            sps.updatedBy = requser.username;
            await this.studentPsRepository.save(sps);
            logger.debug(`reqUser: ${requser.username} studentps studentChangeGroup service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`eqUser: ${requser.username} error in studentps studentChangeGroup service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async findAllPsByStudent(reqUser: ReqUserType, studentId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps findAllPsByStudent service started`);
            const sps = await this.studentPsRepository.find({
                where: { student: { id: studentId, usermaster: { id: reqUser.sub } } },
                select: { id: true, ps: { id: true, academicyear: true, semester: true, studentyear: true, status: true, groupcount: true } },
                relations: { ps: true },
                order: { status: 'ASC' }
            })
            logger.debug(`reqUser: ${reqUser.username} studentps findAllPsByStudent service returned`);
            return { Error: false, payload: sps }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps findAllPsByStudent service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async replaceStudentInGroup(reqUser: ReqUserType, replaceStudentInGroupDto: ReplaceStudentInGroupDto) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps findAllPsByStudent service started`);
            await this.studentPsRepository.update({ id: replaceStudentInGroupDto.oldStudentSpsId }, {
                group: null,
                updatedBy: reqUser.username,
                g_lock: null,
                group_status: GroupFormEnum.NOTINGROUP
            });
            await this.studentPsRepository.update({
                student: { id: replaceStudentInGroupDto.newStudentId }, ps: { id: replaceStudentInGroupDto.psId }
            }, {
                group: { id: replaceStudentInGroupDto.gId } as GroupMaster,
                updatedBy: reqUser.username,
                g_lock: reqUser.sub,
                group_status: GroupFormEnum.INGROUP
            });
            logger.debug(`reqUser: ${reqUser.username} studentps findAllPsByStudent service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.STUDENT_GROUP_REPLACE }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps findAllPsByStudent service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async removeStudentFromGroup(reqUsername: string, spsId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps removeStudentFromGroup service started`);
            await this.studentPsRepository.update({ id: spsId }, {
                group: null,
                g_lock: null,
                group_status: GroupFormEnum.NOTINGROUP,
                updatedBy: reqUsername,
            });
            logger.debug(`reqUser: ${reqUsername} studentps removeStudentFromGroup service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.STUDENT_REMOVED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps removeStudentFromGroup service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async addNewStudentToGroup(reqUser: ReqUserType, addNewStudentToGroupDto: AddNewStudentToGroupDto) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps addNewStudentToGroup service started`);
            await this.studentPsRepository.update({
                ps: { id: addNewStudentToGroupDto.psId }, student: { id: addNewStudentToGroupDto.studentId }
            }, {
                group: { id: addNewStudentToGroupDto.gId } as GroupMaster,
                g_lock: reqUser.sub,
                updatedBy: reqUser.username,
                group_status: GroupFormEnum.INGROUP
            });
            logger.debug(`reqUser: ${reqUser.username} studentps addNewStudentToGroup service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.STUDENT_GROUP_ADDED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps addNewStudentToGroup service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async mentorDashboardReport(reqUser: ReqUserType, mentorId: number, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps mentorDashboardReport service started`)
            // //project base report
            const project_daily_query: any = `SELECT p.title, COUNT(DISTINCT sps.id) AS total_students, COALESCE(SUM(tasks.task_count), 0) AS tasks, COALESCE(SUM(tasks.endorsed_count), 0) 
            AS tasks_endorsed, COALESCE(SUM(attendance.total_count), 0) AS total_attendance, COALESCE(SUM(attendance.present_count), 0) AS present_attendance FROM project_master p 
            LEFT JOIN mentor_project_mapping mpm on mpm.projectMasterId = p.id join mentor_master m on m.id = mpm.mentorMasterId LEFT JOIN group_master g ON g.projectId = p.id LEFT JOIN student_ps sps ON sps.groupId = g.id 
            left JOIN ( SELECT spsId, createdon, COUNT(*) AS task_count, SUM(CASE WHEN endorsed = true THEN 1 ELSE 0 END) AS endorsed_count FROM project_progress 
            GROUP BY spsId,createdon ) AS tasks ON tasks.spsId = sps.id and date(tasks.createdon) = curdate() left join( select spsId,createdon,count(*) as total_count, 
            sum(case when attendance = '${AttendanceEnum.PRESENT}' then 1 else 0 end) as present_count from attendance group by spsId, createdon )as attendance on attendance.spsId = sps.id 
            and date(attendance.createdon) = curdate() WHERE p.psId =${psId} and mpm.mentorMasterId  = ${mentorId} and m.usermasterId = ${reqUser.sub} GROUP BY p.id;`;
            const project_daily_data = await this.studentPsRepository.query(project_daily_query)


            const project_overall_query: any = `SELECT p.title, COUNT(DISTINCT sps.id) AS total_students, COALESCE(SUM(tasks.task_count), 0) AS tasks, COALESCE(SUM(tasks.endorsed_count), 0) 
            AS tasks_endorsed, COALESCE(SUM(attendance.total_count), 0) AS total_attendance, COALESCE(SUM(attendance.present_count), 0) AS present_attendance FROM project_master p 
            LEFT JOIN mentor_project_mapping mpm on mpm.projectMasterId = p.id join mentor_master m on m.id = mpm.mentorMasterId
            LEFT JOIN group_master g ON g.projectId = p.id LEFT JOIN student_ps sps ON sps.groupId = g.id left JOIN ( SELECT spsId, COUNT(*) AS task_count, 
            SUM(CASE WHEN endorsed = true THEN 1 ELSE 0 END) AS endorsed_count FROM project_progress GROUP BY spsId) AS tasks ON tasks.spsId = sps.id 
            left join( select spsId,count(*) as total_count, sum(case when attendance = '${AttendanceEnum.PRESENT}' then 1 else 0 end) as present_count from attendance 
            group by spsId )as attendance on attendance.spsId = sps.id WHERE p.psId =${psId} and mpm.mentorMasterId  = ${mentorId} and m.usermasterId = ${reqUser.sub} GROUP BY p.id;`;
            const project_overall_data = await this.studentPsRepository.query(project_overall_query)


            // student based report
            const student_daily_query = `SELECT u.username AS rollno, s.name AS name, g.name AS groupname, p.title AS project, CASE WHEN a.attendance = 'PRESENT' THEN 1 WHEN a.attendance = 'ABSENT' THEN 0 ELSE NULL END 
            AS attendance, CASE WHEN pp.id then 1 ELSE null END as task, CASE WHEN pp.endorsed THEN pp.endorsed ELSE pp.endorsed END as endorsed FROM user_master u JOIN student_master s 
            ON s.usermasterId = u.id JOIN student_ps sps ON s.id = sps.studentId AND sps.psId = ${psId} AND sps.status = 'ACTIVE' JOIN group_master g ON g.id = sps.groupId 
            JOIN project_master p ON g.projectId = p.id JOIN mentor_project_mapping mpm ON mpm.projectMasterId = p.id AND mpm.mentorMasterId = ${mentorId} join mentor_master m on m.id = mpm.mentorMasterId and m.usermasterId = ${reqUser.sub}
            LEFT JOIN attendance a ON a.spsId = sps.id AND date(a.createdon) = curdate() LEFT JOIN project_progress pp ON pp.spsId = sps.id AND date(pp.createdon) = curdate();`;
            const student_daily_data = await this.studentPsRepository.query(student_daily_query)

            const student_overall_query = `SELECT u.username as rollno, g.name AS groupname, p.title AS project, COALESCE(individual_attendance.total_count, 0) as total_attendance, 
            COALESCE(individual_attendance.present_count, 0) as present_attendance, COALESCE(individual_task.total_count, 0) as tasks, COALESCE(individual_task.endorsed_count, 0) as endorsed,
            COALESCE(ROUND((individual_attendance.present_count / individual_attendance.total_count) * 100, 2), 0) AS attendance_percentage from student_ps sps LEFT JOIN group_master g on g.id = sps.groupId 
            LEFT JOIN project_master p on p.id = g.projectId LEFT JOIN mentor_project_mapping mpm on mpm.projectMasterId = p.id join mentor_master m on m.id = mpm.mentorMasterId and m.usermasterId = ${reqUser.sub} LEFT JOIN student_master s on sps.studentId = s.id 
            LEFT JOIN user_master u on u.id = s.usermasterId LEFT JOIN (SELECT spsId,count(*) as total_count, COUNT(CASE WHEN endorsed = true THEN 1 END) as endorsed_count 
            from project_progress GROUP by spsId)as individual_task on individual_task.spsId = sps.id LEFT JOIN (SELECT spsId,count(*) as total_count, 
            COUNT(CASE WHEN attendance = '${AttendanceEnum.PRESENT}' THEN 1 END) as present_count from attendance GROUP by spsId)as individual_attendance on individual_attendance.spsId = sps.id
            WHERE sps.psId = ${psId} and mpm.mentorMasterId = ${mentorId} and sps.status = '${SType.ACTIVE}'; `;
            const student_overall_data = await this.studentPsRepository.query(student_overall_query)
            logger.debug(`reqUser: ${reqUser.username} studentps mentorDashboardReport service returned`)
            return {
                Error: false,
                payload: {
                    project: { project_daily_data: project_daily_data, project_overall_data: project_overall_data },
                    student: { student_daily_data: student_daily_data, student_overall_data: student_overall_data }
                }
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps mentorDashboardReport service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async adminDailyDashboardReport(reqUser: ReqUserType, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps adminDailyDashboardReport service started`);
            if (reqUser.role == RType.ADMIN) {
                const admin = await this.psMasterRepository.findOne({ where: { id: psId, college: { adminmaster: { usermaster: { id: reqUser.sub } } } } });
                if (admin == null)
                    throw "Admin not found for PS"
            }
            const daily_query = `SELECT p.title as title, COUNT(DISTINCT sps.id) AS total_students, COALESCE(SUM(tasks.task_count), 0) AS tasks, COALESCE(SUM(tasks.endorsed_count), 0) AS tasks_endorsed, COALESCE(SUM(attendance.total_count), 0) AS total_attendance, COALESCE(SUM(attendance.present_count), 0) AS present_attendance FROM project_master p LEFT JOIN group_master g ON g.projectId = p.id LEFT JOIN student_ps sps ON sps.groupId = g.id left JOIN ( SELECT spsId, createdon, COUNT(*) AS task_count, SUM(CASE WHEN endorsed = true THEN 1 ELSE 0 END) AS endorsed_count FROM project_progress GROUP BY spsId,createdon ) AS tasks ON tasks.spsId = sps.id and date(tasks.createdon) = curdate() left join( select spsId,createdon,count(*) as total_count, sum(case when attendance = '${AttendanceEnum.PRESENT}' then 1 else 0 end) as present_count from attendance group by spsId, createdon )as attendance on attendance.spsId = sps.id and date(attendance.createdon) = curdate() WHERE p.psId =${psId} GROUP BY p.id;`;
            const daily_data = await this.studentPsRepository.query(daily_query)

            const overall_query = `SELECT p.title as title, COUNT(DISTINCT sps.id) AS total_students, COALESCE(SUM(tasks.task_count), 0) AS tasks, COALESCE(SUM(tasks.endorsed_count), 0) AS tasks_endorsed, COALESCE(SUM(attendance.total_count), 0) AS total_attendance, COALESCE(SUM(attendance.present_count), 0) AS present_attendance FROM project_master p LEFT JOIN group_master g ON g.projectId = p.id LEFT JOIN student_ps sps ON sps.groupId = g.id left JOIN ( SELECT spsId, COUNT(*) AS task_count, SUM(CASE WHEN endorsed = true THEN 1 ELSE 0 END) AS endorsed_count FROM project_progress GROUP BY spsId ) AS tasks ON tasks.spsId = sps.id left join( select spsId,count(*) as total_count, sum(case when attendance = '${AttendanceEnum.PRESENT}' then 1 else 0 end) as present_count from attendance group by spsId )as attendance on attendance.spsId = sps.id WHERE p.psId =${psId} GROUP BY p.id;`;
            const overall_data = await this.studentPsRepository.query(overall_query)

            logger.debug(`reqUser: ${reqUser.username} studentps adminDailyDashboardReport returned`);
            return { Error: false, payload: { overall_data: overall_data, daily_data: daily_data } }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps adminDailyDashboardReport service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async attendaneFromAndToreport(reqUser: ReqUserType, psId: number, from: string, to: string) { //date format YYYY-MM-DD
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps attendaneFromAndToreport service started`);
            let query
            if (reqUser.role == RType.MENTOR) {
                if (from == null || from == 'null') {
                    query = `SELECT u.username AS rollno, s.name AS name, s.status as status, g.name AS groupname, p.title AS project, a.attendance AS attendance, a.createdon AS date, 
                    a.updatedby AS markedby FROM user_master u left join student_master s on s.usermasterId = u.id left join student_ps sps on sps.studentId = s.id 
                    left join attendance a on sps.id = a.spsId and date(a.createdon) <= date('${to}') left join group_master g on g.id = sps.groupId 
                    left join project_master p on g.projectId = p.id left join mentor_project_mapping mpm on mpm.projectMasterId = p.id left join mentor_master m
                    on m.id = mpm.mentorMasterId where sps.psId = ${psId} and m.userMasterId = ${reqUser.sub}`;
                } else {
                    query = `SELECT u.username AS rollno, s.name AS name, s.status as status, g.name AS groupname, p.title AS project, a.attendance AS attendance, a.createdon AS date, 
                    a.updatedby AS markedby FROM user_master u left join student_master s on s.usermasterId = u.id left join student_ps sps on sps.studentId = s.id 
                    left join attendance a on sps.id = a.spsId and date(a.createdon) BETWEEN date('${from}') AND date('${to}') left join group_master g on g.id = sps.groupId 
                    left join project_master p on g.projectId = p.id left join mentor_project_mapping mpm on mpm.projectMasterId = p.id left join mentor_master m
                    on m.id = mpm.mentorMasterId where sps.psId = ${psId} and m.userMasterId = ${reqUser.sub}`;
                }
            } else if (reqUser.role == RType.ADMIN) {
                if (from == null || from == 'null') {
                    query = `SELECT u.username AS rollno, s.name AS name, s.status as status, g.name AS groupname, p.title AS project, a.attendance AS attendance, a.createdon AS date, 
                    a.updatedby AS markedby FROM user_master u left join student_master s on s.usermasterId = u.id left join student_ps sps on sps.studentId = s.id 
                    JOIN ps_master ps on ps.id = sps.psId join college c on c.id = ps.collegeId join admin_master admin on admin.collegeId = c.id join user_master au on au.id = admin.usermasterId and au.id = ${reqUser.sub}
                    left join attendance a on sps.id = a.spsId and date(a.createdon) <= date('${to}') left join group_master g on g.id = sps.groupId 
                    left join project_master p on g.projectId = p.id where sps.psId = ${psId}`;
                } else {
                    query = `SELECT u.username AS rollno, s.name AS name, s.status as status, g.name AS groupname, p.title AS project, a.attendance AS attendance, a.createdon AS date, 
                    a.updatedby AS markedby FROM user_master u left join student_master s on s.usermasterId = u.id left join student_ps sps on sps.studentId = s.id 
                    JOIN ps_master ps on ps.id = sps.psId join college c on c.id = ps.collegeId join admin_master admin on admin.collegeId = c.id join user_master au on au.id = admin.usermasterId and au.id = ${reqUser.sub}
                    left join attendance a on sps.id = a.spsId and date(a.createdon) BETWEEN date('${from}') AND date('${to}') left join group_master g on g.id = sps.groupId 
                    left join project_master p on g.projectId = p.id where sps.psId = ${psId}`;
                }
            } else {
                if (from == null || from == 'null') {
                    query = `SELECT u.username AS rollno, s.name AS name, s.status as status, g.name AS groupname, p.title AS project, a.attendance AS attendance, a.createdon AS date, 
                    a.updatedby AS markedby FROM user_master u left join student_master s on s.usermasterId = u.id left join student_ps sps on sps.studentId = s.id 
                    left join attendance a on sps.id = a.spsId and date(a.createdon) <= date('${to}') left join group_master g on g.id = sps.groupId 
                    left join project_master p on g.projectId = p.id where sps.psId = ${psId}`;
                } else {
                    query = `SELECT u.username AS rollno, s.name AS name, s.status as status, g.name AS groupname, p.title AS project, a.attendance AS attendance, a.createdon AS date, 
                    a.updatedby AS markedby FROM user_master u left join student_master s on s.usermasterId = u.id left join student_ps sps on sps.studentId = s.id 
                    left join attendance a on sps.id = a.spsId and date(a.createdon) BETWEEN date('${from}') AND date('${to}') left join group_master g on g.id = sps.groupId 
                    left join project_master p on g.projectId = p.id where sps.psId = ${psId}`;
                }
            }
            const data = await this.studentPsRepository.query(query)
            logger.debug(`reqUser: ${reqUser.username} studentps attendaneFromAndToreport service returned`);
            return { Error: false, payload: data }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps attendaneFromAndToreport service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getReportOnMentorsByPs(reqUsername: string, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps getReportOnMentorsByPs service started`);
            const query = `SELECT DATE(a.createdon) AS date, m.name AS mentor, (SELECT COUNT(DISTINCT sps2.id) FROM student_ps sps2 JOIN group_master g2 ON g2.id = sps2.groupId 
        JOIN mentor_project_mapping mpm2 ON mpm2.projectMasterId = g2.projectId WHERE mpm2.mentorMasterId = m.id AND sps2.psId = 2) AS students, COUNT(a.id) AS attendance 
        FROM attendance a LEFT JOIN student_ps sps ON sps.id = a.spsId JOIN group_master g ON g.id = sps.groupId JOIN mentor_project_mapping mpm ON mpm.projectMasterId = g.projectId 
        JOIN mentor_master m ON m.id = mpm.mentorMasterId WHERE sps.psId = ${psId} AND a.createdon <= NOW() GROUP BY date, mentor ORDER BY mentor, date;`
            const data = await this.studentPsRepository.query(query)
            logger.debug(`reqUser: ${reqUsername} studentps getReportOnMentorsByPs service returned`);
            return { Error: false, payload: data }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps getReportOnMentorsByPs service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async getMentorStudentsAtendanceAtGivenDate(reqUser: ReqUserType, mentorStudentdayReportDto: MentorStudentdayReportDto) {
        //get mentor students attendance report on given date 
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps getMentorStudentsAtendanceAtGivenDate service started`);

            const query = `SELECT u.username as rollno, individual_attendance.total_count as total_attendance,individual_attendance.present_count as present_attendance, individual_attendance.updatedby AS \`updatedby\` 
            from student_ps sps LEFT JOIN group_master g on g.id = sps.groupId JOIN project_master p on p.id = g.projectId LEFT JOIN mentor_project_mapping mpm on mpm.projectMasterId = p.id join mentor_master m on m.id = mpm.mentorMasterId 
            join user_master mu on mu.id = m.usermasterId LEFT JOIN student_master s on sps.studentId = s.id LEFT JOIN user_master u on u.id = s.usermasterId 
            LEFT JOIN (SELECT spsId,createdon,updatedby,count(*) as total_count, COUNT(CASE WHEN attendance = '${AttendanceEnum.PRESENT}' THEN 1 END) as present_count 
            from attendance GROUP by spsId,createdon,updatedby)as individual_attendance on date(individual_attendance.createdon) = '${mentorStudentdayReportDto.date}' 
            and individual_attendance.spsId = sps.id WHERE sps.psId = ${mentorStudentdayReportDto.psId} and mpm.mentorMasterId = ${mentorStudentdayReportDto.mentorId} 
            and sps.status = '${SType.ACTIVE}' and mu.id = ${reqUser.sub};`;
            const data = await this.studentPsRepository.query(query)
            logger.debug(`reqUser: ${reqUser.username} studentps getMentorStudentsAtendanceAtGivenDate service returned`);
            return { Error: false, payload: data }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps getMentorStudentsAtendanceAtGivenDate service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async addOrUpdateGitHubLink(reqUser: ReqUserType, addOrUpdateGithubLinkdto: AddOrUpdateGithubLinkDto) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps addOrUpdateGitHubLink service started`);
            const user = await this.studentPsRepository.findOne({ where: { id: addOrUpdateGithubLinkdto.spsId, student: { usermaster: { id: reqUser.sub } } } });
            if (user == null)
                throw ERROR_MESSAGES.USER_NOT_FOUND;
            await this.studentPsRepository.update({
                id: addOrUpdateGithubLinkdto.spsId
            }, {
                githublink: addOrUpdateGithubLinkdto.link,
                gitupdatedon: new Date(),
                updatedBy: reqUser.username,
            });
            logger.debug(`reqUser: ${reqUser.username} studentps addOrUpdateGitHubLink service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPLOADED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error in studentps addOrUpdateGitHubLink service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async addReviewComment(reqUsername: string, addReviewCommentDto: AddReviewCommentDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps addReviewComment service started`);
            const studentps = await this.studentPsRepository.findOneBy({ id: addReviewCommentDto.spsId });

            if (studentps == null)
                throw `Student ${ERROR_MESSAGES.NOT_FOUND}`;

            const comments = studentps.reviewcomments ? [...studentps.reviewcomments] : [];
            const newcomment: ReviewComment = {
                comment: addReviewCommentDto.comment,
                addedon: new Date(),
                givenby: reqUsername,
            }
            comments.push(newcomment)
            await this.studentPsRepository.update({
                id: addReviewCommentDto.spsId
            }, {
                reviewcomments: comments,
                reviewcommentnotification: true,
                updatedBy: reqUsername,
            });
            logger.debug(`reqUser: ${reqUsername} studentps addReviewComment service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPLOADED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error in studentps addReviewComment service > ${err_message}`);
            return { Error: true, message: err_message };
        }
    }

    async offReviewNotification(reqUser: ReqUserType, spsId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps offReviewNotification service started`);
            await this.studentPsRepository.update({ id: spsId, student: { usermaster: { id: reqUser.sub } } }, {
                reviewcommentnotification: false,
            });
            logger.debug(`reqUser: ${reqUser.username} studentps offReviewNotification service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in studentps offReviewNotification service`);
            return { Error: true, message: err_message };
        }
    }

    async findAllStudentsReport(reqUsername: string, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentps findAllStudentsReport service started`);
            const data = await this.studentPsRepository.find({
                where: { ps: { id: psId }, student: { name: Not(Like('VIRTUALSTUDENT%')) } },
                relations: {
                    milestonestudentps: { milestone: true },
                    student: { usermaster: true },
                    group: { project: { mentors: true } },
                    es: { evaluationschedule: true, evaluationresult: true, evaluator: true }
                }
            })
            const format_data = await Promise.all(data.map(async (sps: any) => {
                const attendance = await this.attendanceService.getTotalAttendance(reqUsername, sps.id);
                const json = {
                    studentId: sps.student?.id,
                    Name: sps.student?.name,
                    RollNo: sps.student?.usermaster.username,
                    Section: sps.student.section,
                    attendance: attendance?.payload,
                    Group: sps.group?.name || 'Not In Group',
                    Project: sps.group?.project?.title || 'Not Enrolled',
                    Mentors: sps.group?.project?.mentors?.map((m: any) => m.name) || 'Project Not Enrolled',
                    Reviewcomments: sps.reviewcomments || [],
                    Milestones: sps.milestonestudentps.map((m: any) => ({
                        Name: m.milestone.name,
                        totalweightage: m.milestone.weightage,
                        Marks: m.marks,
                        Marksgivenby: m.marksgivenby,
                        Details: m.milestonedetails,
                    })) || [],
                    // milestonestudentps: { id: true, milestone: { name : true , weightage : true ,  }, milestonedetails: true , marksgiven : true  },
                    Evaluations: sps.es.map((es: any) => {
                        let score: any = 'N/A'
                        if (es.evaluationresult) {
                            score = Math.ceil((((es.evaluationresult.answer1 + es.evaluationresult.answer2) / 2) + ((es.evaluationresult.answer3 + es.evaluationresult.answer4 + es.evaluationresult.answer5) / 3) + ((es.evaluationresult.answer6 + es.evaluationresult.answer7) / 2) + ((es.evaluationresult.answer8 + es.evaluationresult.answer9 + es.evaluationresult.answer10) / 3)) / 4)
                        }
                        return {
                            Name: es?.evaluationschedule.name,
                            Type: es?.type,
                            Evaluator: es?.evaluator?.name,
                            Result: score,
                            Grade: es.evaluationresult?.grade,
                            Comments: es.evaluationresult?.comments,
                        }

                    })
                }
                return json
            }))
            logger.debug(`reqUser: ${reqUsername} studentps findAllStudentsReport service returned`);
            return { Error: false, payload: format_data }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in studentps findAllStudentsReport service`);
            return { Error: true, message: err_message };
        }
    }

    async addMentorReviewComments(reqUser: ReqUserType, addMentorReviewCommentDto: AddMentorReviewCommentDto) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentps addMentorReviewComments service started`);
            const verify_sps = await this.studentPsRepository.findOne({
                where: {
                    id: addMentorReviewCommentDto.spsId,
                    group: {
                        project: {
                            id: addMentorReviewCommentDto.projectId,
                            mentors: { usermaster: { id: reqUser.sub } }
                        }
                    }
                }
            })
            if (verify_sps == null)
                throw "Mentor or Student not found for project";

            const comment: ReviewComment = {
                comment: addMentorReviewCommentDto.comment,
                addedon: new Date(),
                givenby: reqUser.username
            }
            await this.studentPsRepository.update({ id: addMentorReviewCommentDto.spsId }, {
                mentorreviewcomments: verify_sps.mentorreviewcomments == null ? [comment] : [...verify_sps.mentorreviewcomments, comment]
            })
            logger.debug(`reqUser: ${reqUser.username} studentps addMentorReviewComments service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.COMMENT }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in studentps addMentorReviewComments service`);
            return { Error: true, message: err_message };
        }
    }

    /* 
        From this, note that all the services below belong to cron jobs in different projects and attendance sync services.
        Do not change the logic until you fully understand it.
    */

    async syncAttendanceToTrinetraCronJob() {
        //this is only for 2nd years afternoon attendance  based on timings please try to sync attendance
        logger.debug(`reqUser: TrinetraCron syncAttendanceToTrinetraCronJob started`)
        const present = '1'
        const absent = '0'
        const method = "3318"
        let date = moment().format('YY-MM-DD');
        let D = new Date(moment(date, 'YY-MM-DD').format('YYYY-MM-DD'));
        let tomorrowD = new Date(D.getTime() + 24 * 60 * 60 * 1000);
        const ps_attendance = await this.studentPsRepository
            .createQueryBuilder('sps')
            .leftJoinAndSelect('sps.student', 's')
            .leftJoinAndSelect('sps.attendance', 'att')
            .leftJoin('s.college', 'clg')
            .leftJoinAndSelect('s.usermaster', 'u')
            .where('att.createdon BETWEEN :D AND :tomorrowD', { D, tomorrowD })
            .andWhere('u.username NOT LIKE :username', { username: 'VIRTUALSTUDENT%' })
            .select([
                'u.username as htno',
                'att.attendance as attendance',
                'clg.code as clgCode'
            ])
            .getRawMany()
        logger.debug(`reqUser: TrinetraCron total_student_attendance_count: ${ps_attendance.length}`)
        const kmitcollegedata: any[] = [];
        const ngitcollegedata: any[] = [];
        const kmeccollegedata: any[] = [];
        const kmcecollegedata: any[] = [];
        let responses = [];

        if (ps_attendance.length > 0) {

            await Promise.all(ps_attendance?.map((obj) => {
                const json = {
                    htno: obj.htno,
                    noon: obj.attendance == AttendanceEnum.PRESENT ? present : absent,
                    attdate: date
                }
                if (obj.clgCode == 'KMIT') {
                    kmitcollegedata.push(json);
                } else if (obj.clgCode == 'NGIT') {
                    ngitcollegedata.push(json);
                } else if (obj.clgCode == 'KMEC') {
                    kmeccollegedata.push(json);
                } else if (obj.clgCode == 'KMCE') {
                    kmcecollegedata.push(json);
                } else {
                    return
                }
            }));
            const kmit_send_data = JSON.stringify({
                "method": method,
                "students": kmitcollegedata
            });
            const ngit_send_data = JSON.stringify({
                "method": method,
                "students": ngitcollegedata
            });
            const kmec_send_data = JSON.stringify({
                "method": method,
                "students": kmeccollegedata
            });
            const kmce_send_data = JSON.stringify({
                "method": method,
                "students": kmcecollegedata
            });
            if (kmitcollegedata.length > 0) {
                logger.info(`reqUser: TrinetraCron > kmit_ps_attendance: ${JSON.stringify(kmitcollegedata)} > kmit_ps_attendance_length: ${kmitcollegedata.length} > kmit_send_data: ${JSON.stringify(kmit_send_data)}`)
                const SendDataRes = await axios.post(`${process.env.KMIT_TRINETRA_URL}`, kmit_send_data);
                responses.push({ kmit: SendDataRes.data })
                logger.info(`reqUser: TrinetraCron > kmit_returned > ${JSON.stringify(SendDataRes.data)}`);
            } else {
                logger.info(`reqUser: TrinetraCron > syncAttendanceToTrinetraCronJob log > kmit_attendance_length: ${kmitcollegedata.length} --attendance null `);
                responses.push({ kmit: "data null" })
            }

            if (ngitcollegedata.length > 0) {
                logger.info(`reqUser: TrinetraCron > ngit_ps_attendance: ${JSON.stringify(ngitcollegedata)} > ngit_ps_attendance_length: ${ngitcollegedata.length} > ngit_send_data: ${JSON.stringify(ngit_send_data)}`)
                const SendDataRes = await axios.post(`${process.env.NGIT_TRINETRA_URL}`, ngit_send_data);
                responses.push({ ngit: SendDataRes.data })
                logger.info(`reqUser: TrinetraCron > ngit_returned > ${SendDataRes.data}`);
            } else {
                logger.info(`reqUser: TrinetraCron > syncAttendanceToTrinetraCronJob log > ngit_ps_attendance_length: ${ngitcollegedata.length} --attendance null `);
                responses.push({ ngit: "data null" })
            }

            logger.info("We are not syncing ps attendane for kmen and kmce students");
            if (kmeccollegedata.length > 0) {
                logger.info(`reqUser: TrinetraCron > kmec_ps_attendance: ${JSON.stringify(kmeccollegedata)} > kmec_ps_attendance_length: ${kmeccollegedata.length} > kmec_send_data: ${JSON.stringify(kmec_send_data)}`)
                const SendDataRes = await axios.post(`${process.env.KMEC_TRINETRA_URL}`, kmec_send_data);
                responses.push({ kmec: SendDataRes.data })
                logger.info(`reqUser: TrinetraCron > kmec_returned > ${SendDataRes.data}`);
            } else {
                logger.info(`reqUser: TrinetraCron > syncAttendanceToTrinetraCronJob log > kmec_attendance_length: ${kmeccollegedata.length} --attendance null `);
                responses.push({ kmec: "data null" })
            }

            // if (kmcecollegedata.length > 0) {
            //     logger.info(`reqUser: TrinetraCron > kmce_ps_attendance: ${JSON.stringify(kmcecollegedata)} > kmce_ps_attendance_length: ${kmcecollegedata.length} > kmce_send_data: ${JSON.stringify(kmce_send_data)}`)
            //     const SendDataRes = await axios.post(`${process.env.TRINETRA_URL}`, kmce_send_data);
            //     responses.push({ kmce: SendDataRes.data })
            //     logger.info(`reqUser: TrinetraCron > 
            //     kmce_returned > ${SendDataRes.data}`);
            // } else {
            //     logger.info(`reqUser: TrinetraCron > syncAttendanceToTrinetraCronJob log > kmce_attendance_length: ${kmcecollegedata.length} --attendance null `);
            //     responses.push({ kmce: "data null" })
            // }
            logger.debug(`reqUser: TrinetraCron syncAttendanceToTrinetraCronJob completed`)

            /*axios example res data format
              SendDataRes.data string(16) "----------------"
              string(15) "375--totalcount"
              string(14) "0--insertcount"
              string(16) "375--updatecount"
              string(17) "Array--missedhtno"
              string(15) "0--attskipcount"
              string(16) "----------------"
              { "error": "false", "msg": "Attendance Saved " } */
        }
        responses = responses.length == 0 ? ["Today no ps"] : responses
        this.emailService.cronEmail("Trinetra Cron", "Ps Attendance Trinetra Cron Completed", responses)
    }

    async getDatesBetween(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let datesArray = [];
        let currentDate = start;
        while (currentDate <= end) {
            const date = moment(currentDate).format('YYYY-MM-DD')
            datesArray.push(date);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return datesArray;
    }

    async syncPastDateAttendanceBetweenDates(reqUsername: string, syncPastDateAttendanceBetweenDatesDto: SyncPastDateAttendanceBetweenDatesDto) {
        logger.debug(`reqUser: ${reqUsername} syncPastDateAttendanceBetweenDates method started`)
        const betweendates = await this.getDatesBetween(syncPastDateAttendanceBetweenDatesDto.startDate, syncPastDateAttendanceBetweenDatesDto.endDate);
        logger.debug(`dates between given start and end ${betweendates}`)
        const sync_res = []
        for (let i = 0; i < betweendates.length; i++) {
            const syncdate = betweendates[i];
            const syncPastDateAttendanceDto = new SyncPastDateAttendanceDto()
            syncPastDateAttendanceDto.previousdate = syncdate;
            syncPastDateAttendanceDto.code = syncPastDateAttendanceBetweenDatesDto.code;
            const res = await this.syncPastDateAttendance(reqUsername, syncPastDateAttendanceDto)
            sync_res.push({ date: syncdate, server_res: res })
        }
        logger.debug(`reqUser: ${reqUsername} syncPastDateAttendanceBetweenDates server responsed ${JSON.stringify(sync_res)}`)
        return sync_res;
    }

    async syncPastDateAttendance(reqUsername: string, syncPastDateAttendanceDto: SyncPastDateAttendanceDto) {   //previousdate format YYYY-MM-DD and code is clg code ex: KMIT, NGIT
        // logger.debug(`reqUser: ${reqUsername} syncPastDateAttendance method started syncPastDateAttendanceDto: ${JSON.stringify(syncPastDateAttendanceDto)}`)
        const present = '1'
        const absent = '0'
        const method = "3318"
        let date = moment(syncPastDateAttendanceDto.previousdate, 'YYYY-MM-DD').format('YY-MM-DD');
        let D = new Date(moment(date, 'YY-MM-DD').format('YYYY-MM-DD'));
        let tomorrowD = new Date(D.getTime() + 24 * 60 * 60 * 1000);
        const ps_attendance = await this.studentPsRepository
            .createQueryBuilder('sps')
            .leftJoinAndSelect('sps.student', 's')
            .leftJoinAndSelect('sps.attendance', 'att')
            .leftJoin('s.college', 'clg')
            .leftJoinAndSelect('s.usermaster', 'u')
            .where('att.createdon BETWEEN :D AND :tomorrowD', { D, tomorrowD })
            .andWhere('u.username NOT LIKE :username', { username: 'VIRTUALSTUDENT%' })
            .select([
                'u.username as htno',
                'att.attendance as attendance',
                'clg.code as clgCode'
            ])
            .getRawMany()

        const collegedata: any[] = [];
        let SendDataRes = null
        if (ps_attendance.length > 0) {

            await Promise.all(ps_attendance?.map((obj) => {
                const json = {
                    htno: obj.htno,
                    noon: obj.attendance == AttendanceEnum.PRESENT ? present : absent,
                    attdate: date
                }
                if (obj.clgCode == syncPastDateAttendanceDto.code) {
                    collegedata.push(json)
                } else {
                    return;
                }
            }));
            const send_data = JSON.stringify({
                "method": method,
                "students": collegedata
            });

            if (collegedata.length > 0) {
                logger.info(`reqUser: ${reqUsername} syncPastDateAttendance date of given college on given date > ps_attendance_length: ${collegedata.length} > ps_attendance: ${JSON.stringify(collegedata)} > send_data: ${JSON.stringify(send_data)}`)
                if (syncPastDateAttendanceDto.code == 'KMIT') {
                    try {
                        SendDataRes = await axios.post(`${process.env.KMIT_TRINETRA_URL}`, send_data);
                    } catch (error) {
                        console.error('Error sending data:', error);
                    }
                } else if (syncPastDateAttendanceDto.code == "NGIT") {
                    try {
                        SendDataRes = await axios.post(`${process.env.NGIT_TRINETRA_URL}`, send_data);
                    } catch (error) {
                        console.error('Error sending data:', error);
                    }
                } else if (syncPastDateAttendanceDto.code == "KMEC") {
                    try {
                        SendDataRes = await axios.post(`${process.env.KMEC_TRINETRA_URL}`, send_data);
                    } catch (error) {
                        console.error('Error sending data:', error);
                    }
                } else {
                    logger.info(`reqUser: ${reqUsername} syncPastDateAttendance > log > attendance_length: ${collegedata.length} --attendance null `);
                }
                logger.info(`reqUser: ${reqUsername} syncPastDateAttendance > axios post response > ${SendDataRes?.data}`);
            }
        }
        logger.debug(`reqUser: ${reqUsername} syncPastDateAttendance method data sync completed for requested data`)
        return SendDataRes?.data ?? null;
    }

    //dont change this service
    async attByDateForBD(date: string) { // day = mm-dd-yy // for bhavyadrishti
        try {
            logger.debug(`studentps attByDateForBD service started`);
            const present = '1'
            const absent = '0'
            let D = new Date(moment(date, 'MM-DD-YYYY').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
            let tomorrowD = new Date(D.getTime() + 24 * 60 * 60 * 1000);
            const ps_attendance = await this.studentPsRepository
                .createQueryBuilder('sps')
                .leftJoinAndSelect('sps.student', 's')
                .leftJoinAndSelect('sps.attendance', 'att')
                .leftJoinAndSelect('s.usermaster', 'u')
                .where('att.createdon BETWEEN :D AND :tomorrowD', { D, tomorrowD })
                .andWhere('u.username NOT LIKE :username', { username: 'VIRTUALSTUDENT%' })
                .select([
                    's.id as studentId',
                    's.name as studentName',
                    'u.username as username',
                    'att.attendance as attendance',
                ])
                .getRawMany()
            const result = await Promise.all(ps_attendance.map((obj) => {
                const json = {
                    studentId: obj.studentId,
                    studentName: obj.studentName,
                    username: obj.username,
                    attendance: obj.attendance == AttendanceEnum.PRESENT ? present : absent,
                }
                return json
            }));
            logger.debug(`studentps attByDateForBD service returned`);
            return { Error: false, payload: result }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`error:${err_message} > error in studentps attByDateForBD service`);
            return { Error: true, message: err_message };
        }
    }

    //dont change this service
    async sendDataToDb() {  // for bhavyadrishti
        try {
            logger.debug(`studentps sendDataToDb service started`);
            const res = await this.studentPsRepository.find({
                where: { ps: { status: PSSType.IN_PROGRESS }, status: SType.ACTIVE, group_status: GroupFormEnum.INGROUP, group: { project: Not(IsNull()) } },
                relations: { student: { usermaster: true }, ps: true, group: { project: { mentors: true } } },
                select: {
                    id: true,
                    student: {
                        id: true, name: true,
                        usermaster: { id: true, username: true }
                    },
                    ps: { id: true, studentyear: true, semester: true },
                    group: {
                        id: true, name: true,
                        createdby: true, status: true,
                        project: {
                            id: true, title: true, category: true, problemstatement: true, techstack: true, reflink: true,
                            mentors: { id: true, name: true }
                        }
                    }
                }
            });
            const final = []
            for (let i = 0; i < res.length; i++) {
                final.push({
                    student_name: res[i].student.name,
                    rollno: res[i].student.usermaster.username,
                    ps_id: res[i].ps.id,
                    student_year: res[i].ps.studentyear,
                    semester: res[i].ps.semester,
                    problem_statement: res[i].group?.project?.problemstatement || 'N/A',
                    category: res[i].group?.project?.category || 'N/A',
                    project: res[i].group?.project?.title || 'N/A',
                    tech_stack: res[i].group?.project?.techstack || 'N/A',
                    reflink: res[i].group?.project?.reflink || 'N/A',
                    mentor: res[i].group?.project?.mentors?.map((m) => m.name) || 'N/A',
                    peers: 'N/A'
                })
            }
            logger.debug(`studentps sendDataToDb service returned`);
            return { Error: false, payload: final }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`error: ${err_message} > error in studentps sendDataToDb service`);
            return { Error: true, message: err_message };
        }
    }

    async sendEmailsToMentorCron() {
        try {
            logger.debug("send emails to mentors cron started")
            const allWorkingPs = await this.psMasterRepository.find({
                where: { status: PSSType.IN_PROGRESS },
                relations: { projects: { mentors: true }, college: true }
            });

            for (const ps of allWorkingPs) {
                const isWorkingDay = await this.attendanceService.checkTodayWorkingDayForPs(ps.id);
                if (!isWorkingDay) continue;

                for (const project of ps.projects) {
                    for (const mentor of project.mentors) {
                        if (mentor.email == null)
                            continue;

                        const query = `SELECT u.username AS rollno, s.name AS name, g.name AS groupname, CASE WHEN a.attendance = 'PRESENT' THEN 1 WHEN a.attendance = 'ABSENT' THEN 0 ELSE NULL END AS attendance 
                         FROM user_master u JOIN student_master s ON s.usermasterId = u.id JOIN student_ps sps ON s.id = sps.studentId AND sps.psId = ${ps.id} AND sps.status = 'ACTIVE'
                         JOIN group_master g ON g.id = sps.groupId JOIN project_master p ON g.projectId = p.id AND p.id = ${project.id} JOIN mentor_project_mapping mpm ON mpm.projectMasterId = p.id 
                         AND mpm.mentorMasterId = ${mentor.id} LEFT JOIN attendance a ON a.spsId = sps.id AND date(a.createdon) = curdate() 
                         LEFT JOIN project_progress pp ON pp.spsId = sps.id AND date(pp.createdon) = curdate();`
                        const data = await this.studentPsRepository.query(query);

                        const jsonData = {
                            mentor_name: mentor.name,
                            mentor_mail: mentor.email,
                            ps_AY: ps.academicyear,
                            ps_stuyear: ps.studentyear,
                            ps_sem: ps.semester,
                            college: ps.college.name,
                            project_title: project.title,
                            attendance: data,
                        }
                        try {
                            const res = await this.emailService.sendMentorAttendanceEmail(jsonData);
                            logger.debug(`Email sent response > ${JSON.stringify(res)}`);
                        } catch (emailError) {
                            logger.error(`Failed to send email to ${mentor.email}: ${emailError.message}`);
                        }
                    }
                }
            }
            logger.debug("send emails to mentors cron ended")
        } catch (error) {
            logger.error(`error in getting data to send email to mentor error> ${error?.message}`)
        }
    }
}