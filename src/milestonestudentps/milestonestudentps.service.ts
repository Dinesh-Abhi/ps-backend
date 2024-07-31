import { Injectable } from '@nestjs/common';
import { AddCommentsByMentor, AddMakrsToMilestoneByMentor, MilestoneStudentPsCreateOrUpdateDto } from './dto/milestonestudentps.dto';
import { Repository } from 'typeorm';
import { MilestoneStudentPs } from './milestonestudentps.entity';
import { InjectRepository } from '@nestjs/typeorm';
import logger from 'src/loggerfile/logger';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { Milestone } from 'src/milestone/milestone.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { MilestoneService } from 'src/milestone/milestone.service';
import { ReviewComment, studentMilestoneDetails } from '../common.interfaces '
import { ReqUserType } from 'src/all.formats';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { PSSType, SType } from 'src/enums';

@Injectable()
export class MilestoneStudentPsService {
    constructor(
        @InjectRepository(StudentPs)
        private readonly studentPsRepository: Repository<StudentPs>,
        @InjectRepository(MilestoneStudentPs)
        private readonly mileStoneStudentPsRepository: Repository<MilestoneStudentPs>,
        @InjectRepository(Milestone)
        private readonly mileStoneRepository: Repository<Milestone>,
        @InjectRepository(PsMaster)
        private readonly psMasterRepository: Repository<PsMaster>,
        private readonly mileStoneService: MilestoneService,
    ) { }

    async createOrUpdate(reqUser: ReqUserType, milestoneStudentPsCreateOrUpdateDto: MilestoneStudentPsCreateOrUpdateDto) {
        try {
            logger.debug(`reqUser: ${reqUser.username} milestonestudentps createOrUpdate service started`);
            const milestone = await this.mileStoneRepository.findOneBy({ id: milestoneStudentPsCreateOrUpdateDto.msId });
            logger.debug(`reqUser: ${reqUser.username} milestone uploading for milestone ${JSON.stringify(milestone)}`);

            if (!milestone)
                throw ERROR_MESSAGES.MILESTONE_NOT_FOUND;
            if (milestone.enable == false)
                throw ERROR_MESSAGES.MILESTONE_NOT_ENABLED;
            if (milestone.lastdate != null) {
                const curr_date = new Date()
                curr_date.setUTCHours(0, 0, 0, 0);
                const last_date = new Date(milestone?.lastdate)
                last_date.setUTCHours(0, 0, 0, 0);
                logger.debug(`reqUser: ${reqUser.username} milestone uploading for milestone curr_date: "${curr_date.toISOString()}" last_date: "${last_date.toISOString()}" curr_date_time: ${curr_date.getTime()} last_date_time: ${last_date.getTime()} checking milestone end condition: ${(last_date.getTime() < curr_date.getTime())}`)
                if (last_date.getTime() < curr_date.getTime())
                    throw ERROR_MESSAGES.MILESTONE_END;
            }

            const student = await this.studentPsRepository.findOne({ where: { id: milestoneStudentPsCreateOrUpdateDto.spsId, status: SType.ACTIVE, student: { usermaster: { id: reqUser.sub } } } })
            if (student == null)
                throw ERROR_MESSAGES.USER_NOT_FOUND;

            const studentmilestone = await this.mileStoneStudentPsRepository.findOne({ where: { msId: milestoneStudentPsCreateOrUpdateDto.msId, spsId: milestoneStudentPsCreateOrUpdateDto.spsId, sps: { student: { usermaster: { id: reqUser.sub } } } } });
            if (studentmilestone != null) {
                logger.debug(`reqUser: ${reqUser.username} milestone of id: ${studentmilestone.id} already exists with combination of spsId: ${milestoneStudentPsCreateOrUpdateDto.spsId} and msId: ${milestoneStudentPsCreateOrUpdateDto.msId}`)
                const new_milestonedetails: studentMilestoneDetails = {
                    link: milestoneStudentPsCreateOrUpdateDto.link,
                    addedon: new Date,
                    comments: []
                }

                if (studentmilestone.milestonedetails == null) {
                    const oldcomment: ReviewComment = {
                        comment: studentmilestone.comments,
                        addedon: studentmilestone.lastcommentedon,
                        givenby: 'admin',
                    }
                    const olddetails: studentMilestoneDetails = {
                        link: studentmilestone.link,
                        addedon: studentmilestone.createdon,
                        comments: [oldcomment],
                    }
                    studentmilestone.milestonedetails = [olddetails, new_milestonedetails];
                } else {
                    studentmilestone.milestonedetails = [...studentmilestone.milestonedetails, new_milestonedetails];
                }
                studentmilestone.link = milestoneStudentPsCreateOrUpdateDto.link;
                studentmilestone.updatedby = reqUser.username;
                await this.mileStoneStudentPsRepository.save(studentmilestone);
                logger.debug(`reqUser: ${reqUser.username} milestonestudentps createOrUpdate service returned and updated exists milestone`);
                return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
            } else {
                logger.debug(`reqUser: ${reqUser.username} milestone not exists with spsId: ${milestoneStudentPsCreateOrUpdateDto.spsId} and msId: ${milestoneStudentPsCreateOrUpdateDto.msId}`)

                const milestonedetails: studentMilestoneDetails = {
                    link: milestoneStudentPsCreateOrUpdateDto.link,
                    addedon: new Date,
                    comments: []
                }
                const milestone_sps = new MilestoneStudentPs();
                milestone_sps.link = milestoneStudentPsCreateOrUpdateDto.link;
                milestone_sps.milestone = { id: milestoneStudentPsCreateOrUpdateDto.msId } as Milestone;
                milestone_sps.sps = { id: milestoneStudentPsCreateOrUpdateDto.spsId } as StudentPs;
                milestone_sps.milestonedetails = [milestonedetails];
                milestone_sps.createdby = reqUser.username;
                milestone_sps.updatedby = reqUser.username;
                await this.mileStoneStudentPsRepository.save(milestone_sps);
                logger.debug(`reqUser: ${reqUser.username} milestonestudentps createOrUpdate service returned and inserted new milestone`);
                return { Error: false, message: RESPONSE_MESSAGE.CREATED };
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in milestonestudentps createOrUpdate service`);
            return { Error: true, message: err_message };
        }
    }

    async findByStudent(reqUsername: string, spsId: number, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} milestonestudentps findByStudent service started`);
            const milestone = await this.mileStoneService.findByPs(reqUsername, psId);
            if (milestone.Error)
                throw milestone.message
            if (milestone.payload.length == 0) {
                logger.debug(`reqUser: ${reqUsername} milestonestudentps findByStudent service returned`);
                return { Error: false, payload: [] }
            }
            const student_milestones = await this.mileStoneStudentPsRepository.find({
                where: { spsId: spsId },
                select: { id: true, notification: true, msId: true, link: true, comments: true, lastcommentedon: true, createdon: true, marks: true, marksgivenby: true, markscomments: true, milestonedetails: true, sps: { id: true, student: { id: true, usermaster: { id: true, username: true } } } },
                relations: { sps: { student: { usermaster: true } } }
            });
            // datalogger.data(`milestones requested by: ${reqUsername} of student : ${(student_milestones[0]?.sps?.student?.usermaster?.username) || `not found`}, spsId: ${spsId} and projectId: ${projectId} student milestones data: ${JSON.stringify(student_milestones)}`)
            const transformedData = milestone.payload.map(ms => {
                const student_milestone = student_milestones.find(entry => entry.msId === ms.id);
                return {
                    id: ms.id,
                    name: ms.name,
                    description: ms.description,
                    enable: ms.enable,
                    lastdate: ms.lastdate,
                    milestonedetails: student_milestones.length == 0 ? null : student_milestone ? student_milestone.milestonedetails : null,
                    mspsId: student_milestones.length == 0 ? null : student_milestone ? student_milestone.id : null,
                    notification: student_milestones.length == 0 ? false : student_milestone ? student_milestone.notification : false,
                    lastcommentedon: student_milestones.length == 0 ? null : student_milestone ? student_milestone.lastcommentedon : null,
                    comments: student_milestones.length == 0 ? null : student_milestone ? student_milestone.comments : null,
                    link: student_milestones.length == 0 ? null : student_milestone ? student_milestone.link : null,
                    uploadedon: student_milestones.length == 0 ? null : student_milestone ? student_milestone.createdon : null,
                    totalweightage: ms.weightage,
                    marks: student_milestone ? student_milestone.marks : null,
                    markscomments: student_milestone ? student_milestone.markscomments : null,
                    marksgivenby: student_milestone ? student_milestone.marksgivenby : null
                };
            });
            logger.debug(`reqUser: ${reqUsername} milestonestudentps findByStudent service returned`);
            return { Error: false, payload: transformedData };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in milestonestudentps findByStudent service`);
            return { Error: true, message: err_message };
        }
    }

    async AddComment(reqUsername: string, addCommentsByMentor: AddCommentsByMentor) {
        try {
            logger.debug(`reqUser: ${reqUsername} milestonestudentps AddComment service started`);
            const milestonesps = await this.mileStoneStudentPsRepository.findOne({ where: { id: addCommentsByMentor.mspsId } });
            if (milestonesps == null)
                throw ERROR_MESSAGES.MILESTONE_NOT_FOUND;

            const allmilestonedetails = milestonesps.milestonedetails;

            const newcomment: ReviewComment = {
                comment: addCommentsByMentor.comments,
                addedon: new Date(),
                givenby: reqUsername,
            }

            if (milestonesps.milestonedetails != null) {

                const previous_studentmilestone = allmilestonedetails[allmilestonedetails.length - 1];
                previous_studentmilestone.comments.push(newcomment);
                milestonesps.milestonedetails = allmilestonedetails;

            } else {
                const oldcomment: ReviewComment = {
                    comment: milestonesps.comments,
                    addedon: milestonesps.lastcommentedon,
                    givenby: 'admin',
                }
                const olddetails: studentMilestoneDetails = {
                    link: milestonesps.link,
                    addedon: milestonesps.createdon,
                    comments: [oldcomment],
                }
                olddetails.comments.push(newcomment)
                milestonesps.milestonedetails = [olddetails];
            }

            // milestonesps.comments = addCommentsByMentor.comments;
            milestonesps.notification = true;
            milestonesps.lastcommentedon = new Date();
            milestonesps.updatedby = reqUsername;
            await this.mileStoneStudentPsRepository.save(milestonesps);
            logger.debug(`reqUser: ${reqUsername} milestonestudentps AddComment service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.COMMENT };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in milestonestudentps AddComment service`);
            return { Error: true, message: err_message };
        }
    }

    async ofNotification(reqUser: ReqUserType, id: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} milestonestudentps ofNotification service started`);
            const milestonesps = await this.mileStoneStudentPsRepository.findOneBy({ id: id, sps: { status: SType.ACTIVE, student: { usermaster: { id: reqUser.sub } } } });
            if (milestonesps == null)
                throw "student milestone not found"
            milestonesps.notification = false;
            await this.mileStoneStudentPsRepository.save(milestonesps);
            logger.debug(`reqUser: ${reqUser.username} milestonestudentps ofNotification service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in milestonestudentps ofNotification service`);
            return { Error: true, message: err_message };
        }
    }

    async formatTheStudentsMilestoneDetails() {
        try {
            // logger.debug(`reqUser: ${reqUsername} milestonestudentps ofNotification service started`);
            const studentmilestones = await this.mileStoneStudentPsRepository.find();
            for (let i = 0; i < studentmilestones.length; i++) {
                const milestonesps = studentmilestones[i];
                if (milestonesps.milestonedetails == null) {
                    const comment: ReviewComment = {
                        addedon: milestonesps.createdon,
                        comment: milestonesps.comments,
                        givenby: "admin"
                    }
                    const milestonedetails = {
                        link: milestonesps.link,
                        addedon: new Date,
                        comments: [comment]
                    }
                    milestonesps.milestonedetails = [milestonedetails];
                    await this.mileStoneStudentPsRepository.save(milestonesps);
                }
            }
            // logger.debug(`reqUser: ${reqUsername} milestonestudentps ofNotification service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            // logger.error(`reqUser: ${reqUsername} error: ${(typeof error == 'object' ? error.message : error)} > error in milestonestudentps ofNotification service`);
            return { Error: true, message: (typeof error == 'object' ? error.message : error) };
        }
    }

    async AddMarksToMilestone(reqUser: ReqUserType, addMakrsToMilestoneByMentor: AddMakrsToMilestoneByMentor) {
        try {
            logger.debug(`reqUser: ${reqUser.username} milestonestudentps ofNotification service started`);
            const ps = await this.psMasterRepository.findOne({ where: { id: addMakrsToMilestoneByMentor.psId, status: PSSType.IN_PROGRESS, college: { mentormaster: { id: addMakrsToMilestoneByMentor.mentorId, status: SType.ACTIVE, usermaster: { id: reqUser.sub } } } } })
            if (ps == null)
                throw "PS not found or requested mentor details incorrect";

            const student_milestone = await this.mileStoneStudentPsRepository.findOne({ where: { id: addMakrsToMilestoneByMentor.mspsId, sps: { status: SType.ACTIVE, ps: { id: ps.id } } } })
            if (student_milestone == null)
                throw "Student Milestone not found with given details";

            await this.mileStoneStudentPsRepository.update({ id: student_milestone.id }, {
                marks: addMakrsToMilestoneByMentor.marks,
                markscomments: addMakrsToMilestoneByMentor.comments ?? null,
                marksgivenby: reqUser.username,
                updatedby: reqUser.username
            })

            return { Error: false, message: "Marks "+ RESPONSE_MESSAGE.UPLOADED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in milestonestudentps ofNotification service`);
            return { Error: true, message: err_message };
        }
    }
}
