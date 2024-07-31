import { Injectable } from '@nestjs/common';
import { MentorMaster } from './mentor-master.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMasterDto } from 'src/usermaster/dto/user-master.dto';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { MentorMasterDto, MentorProfileUpdateDto, MentorUpdateDto } from './dto/mentor-master.dto';
import logger from 'src/loggerfile/logger';
import { College } from 'src/college/college.entity';
import { PSSType, RType, SType } from 'src/enums';
import { CollegeService } from 'src/college/college.service';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { ReqUserType } from 'src/all.formats';

@Injectable()
export class MentorMasterService {
    constructor(
        @InjectRepository(MentorMaster)
        private readonly mentorMasterRepository: Repository<MentorMaster>,
        @InjectRepository(UserMaster)
        private readonly userMasterRepository: Repository<UserMaster>,
        private readonly userMasterService: UserMasterService,
        private readonly collegeService: CollegeService,

    ) { }

    async create(reqUsername: string, mentorMasterDto: MentorMasterDto[]) {
        try {
            logger.debug(`reqUser: ${reqUsername} mentormaster create service started`);
            let insertedCount = 0
            let dupCount = 0
            const dupObj = []
            for (let i = 0; i < mentorMasterDto.length; i++) {
                const college = await this.collegeService.findOne(reqUsername, mentorMasterDto[i].collegeId);
                if (college.Error == true || college.payload == null || college.payload.status == SType.INACTIVE) {
                    dupCount++;
                    dupObj.push(mentorMasterDto[i])
                    logger.error(`reqUser: ${reqUsername} error finding college with ${mentorMasterDto[i].collegeId} > ${college.message} > it can be Inactive`)
                    continue;
                }
                const usermaster = await this.userMasterRepository.findOneBy({ username: mentorMasterDto[i].username });
                if (usermaster != null) {
                    dupCount++;
                    dupObj.push(mentorMasterDto[i])
                    continue;
                }
                const userMasterDto = new UserMasterDto()
                userMasterDto.password = mentorMasterDto[i].password;
                userMasterDto.username = mentorMasterDto[i].username.trim();
                userMasterDto.role = RType.MENTOR;
                logger.debug(`reqUser: ${reqUsername} usermasterService create usermaster calling`);
                const user = await this.userMasterService.create(reqUsername, userMasterDto);
                logger.debug(`reqUser: ${reqUsername} return from usermaster mentorcreate > ${JSON.stringify(user)}`)
                if (user.Error) {
                    dupCount++;
                    dupObj.push(mentorMasterDto[i])
                    continue;
                }
                const mentorMaster = new MentorMaster();
                mentorMaster.name = mentorMasterDto[i].name.trim();
                mentorMaster.email = mentorMasterDto[i].email;
                mentorMaster.updatedby = reqUsername;
                mentorMaster.college = { id: mentorMasterDto[i].collegeId } as College;
                mentorMaster.usermaster = { id: user.payload.id } as UserMaster;
                await this.mentorMasterRepository.save(mentorMaster);
                insertedCount++;
            }
            logger.error(`reqUser: ${reqUsername} mentormaster create service returned with dublicates:[${dupObj}]`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED, payload: { dupCount: dupCount, dupObj: dupObj, insertedCount: insertedCount } };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in mentorMaster create service`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUsername: string, mentorUpdateDto: MentorUpdateDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} mentormaster update service started`);
            const mentor = await this.mentorMasterRepository.findOne({ where: { id: mentorUpdateDto.mentorId }, relations: { college: true } });
            if (mentor == null)
                throw new Error("Can't Find Mentor")
            // if (mentor.college.id != mentorUpdateDto.collegeId) {
            const college = await this.collegeService.findOne(reqUsername, mentorUpdateDto.collegeId);
            if (college.Error == true || college.payload == null || college.payload.status == SType.INACTIVE)
                throw `College ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`
            // }
            mentor.name = mentorUpdateDto.name;
            mentor.college = { id: mentorUpdateDto.collegeId } as College;
            mentor.email = mentorUpdateDto.email;
            mentor.status = mentorUpdateDto.status;
            mentor.updatedby = reqUsername;
            await this.mentorMasterRepository.save(mentor);
            logger.debug(`reqUser: ${reqUsername} mentormaster update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in mentorMaster update service`);
            return { Error: true, message: err_message };
        }
    }

    async mentorList(reqUsername: string) {
        try {
            logger.debug(`reqUser: ${reqUsername} mentormaster MentorList service started`)
            const result = await this.mentorMasterRepository.find({
                select: { id: true, status: true, name: true, email: true, usermaster: { id: true, username: true }, college: { id: true, code: true } },
                relations: { usermaster: true, college: true }
            })
            logger.debug(`reqUser: ${reqUsername} mentormaster MentorList service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in mentorMaster mentorList service`);
            return { Error: true, message: err_message };
        }
    }

    async mentorListByClg(reqUsername: string, clgId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} mentormaster mentorListByClg service started`)

            const result = await this.mentorMasterRepository.find({
                where: { college: { id: clgId } },
                select: { id: true, status: true, name: true, usermaster: { id: true, username: true } },
                relations: { usermaster: true }
            })
            logger.debug(`reqUser: ${reqUsername} mentormaster mentorListByClg service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in mentorMaster mentorListByClg service`);
            return { Error: true, message: err_message };
        }
    }

    async getMentorPreviousData(reqUsername: string, mentorId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} mentorMaster getMentorPreviousData service started`);
            const data = await this.mentorMasterRepository.find({
                where: { id: mentorId },
                select: { id: true, name: true, usermaster: { username: true }, college: { name: true }, projects: { title: true, ps: { academicyear: true, studentyear: true, semester: true } } },
                relations: { college: true, usermaster: true, projects: { ps: true } }
            })
            logger.debug(`reqUser: ${reqUsername} mentormaster getMentorPreviousData service returned`);
            return { Error: false, payload: data };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in mentorMaster getMentorPreviousData service`);
            return { Error: true, message: err_message };
        }
    }

    async getCurrentYearProjects(reqUser: ReqUserType, mentorId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} mentorMaster getCurrentYearProjects service started`);
            const data = await this.mentorMasterRepository.find({
                where: { id: mentorId, usermaster: { id: reqUser.sub }, projects: { ps: { status: PSSType.IN_PROGRESS } } },
                select: { id: true, projects: { id: true, title: true, ps: { id: true, academicyear: true, studentyear: true, semester: true, status: true, milestones: true, college: { id: true, code: true } } } },
                relations: { projects: { ps: { milestones: true, college: true } } }
            });
            const transformedData = data.reduce((acc, mentor) => {
                const { projects } = mentor;

                projects.forEach(project => {
                    const { id: projectId, title, ps } = project;
                    const { id: psId, academicyear, studentyear, semester, status, college, milestones } = ps;
                    const { id: clgId, code } = college;

                    let psEntry = acc.find(entry => entry.id === psId);
                    if (!psEntry) {
                        psEntry = {
                            id: psId,
                            college: code,
                            academicyear,
                            studentyear,
                            semester,
                            status,
                            projects: []
                        };
                        acc.push(psEntry);
                    }
                    let milestonecount = 0
                    if (milestones.length == 0) {
                        milestones.map((m) => {
                            if (m.description != null)
                                milestonecount++;
                        });
                    } else
                        milestonecount = 0;
                    const existingProject = psEntry.projects.find(p => p.id === projectId);
                    if (!existingProject) {
                        psEntry.projects.push({ id: projectId, title, milestone: milestonecount });
                    }
                });

                return acc;
            }, []);

            logger.debug(`reqUser: ${reqUser.username} mentorMaster getCurrentYearProjects service returned`);
            return { Error: false, payload: transformedData };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in mentorMaster getCurrentYearProjects service`);
            return { Error: true, message: err_message };
        }
    }

    async mentorProfileUpdate(reqUsername: string, mentorProfileUpdateDto: MentorProfileUpdateDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} mentorMaster mentorProfileUpdate service started`);
            await this.mentorMasterRepository.update({ id: mentorProfileUpdateDto.mentorId }, {
                name: mentorProfileUpdateDto.name,
                email: mentorProfileUpdateDto.email,
                updatedby: reqUsername,
            })
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in mentorMaster mentorProfileUpdate service`);
            return { Error: true, message: err_message };
        }
    }
}
