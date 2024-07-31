import { Injectable } from '@nestjs/common'
import { ProjectMaster } from './project-master.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { PsMaster } from 'src/psmaster/ps-master.entity'
import { DummyProjectDto, EditAssignMentorDto, ProjectMasterBulkDto, UpdateProjectMasterDto } from './dto/project-master.dto'
import logger from 'src/loggerfile/logger'
import { AssignMentorDto } from 'src/projectmaster/dto/project-master.dto'
import { MentorMaster } from 'src/mentormaster/mentor-master.entity'
import { PSSType, RType, SType } from 'src/enums'
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants'
import { ReqUserType } from 'src/all.formats'
import { StudentPs } from 'src/studentps/studentps.entity'
import { College } from 'src/college/college.entity'

@Injectable()
export class ProjectMasterService {
    constructor(
        @InjectRepository(ProjectMaster)
        private readonly projectMasterRepository: Repository<ProjectMaster>,
        @InjectRepository(StudentPs)
        private readonly studentPsRepository: Repository<StudentPs>,
        @InjectRepository(PsMaster)
        private readonly psMasterRepository: Repository<PsMaster>,
        @InjectRepository(MentorMaster)
        private readonly mentorMasterRepository: Repository<MentorMaster>,
        @InjectRepository(College)
        private readonly collegeRepository: Repository<College>,
    ) { }

    async bulkCreate(reqUsername: string, projectMasterBulkDto: ProjectMasterBulkDto[]) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectMaster bulkCreate service started`);
            let dupCount = 0
            const dupObj = []
            for (let i = 0; i < projectMasterBulkDto.length; i++) {
                const ps = await this.psMasterRepository.findOne({
                    where: {
                        status: PSSType.IN_PROGRESS,
                        college: { id: projectMasterBulkDto[i].collegeId },
                        studentyear: projectMasterBulkDto[i].studentyear, academicyear: projectMasterBulkDto[i].academicyear, semester: projectMasterBulkDto[i].semester
                    }
                });
                if (ps == null) {
                    dupCount++;
                    dupObj.push({
                        title: projectMasterBulkDto[i].title,
                        category: projectMasterBulkDto[i].category
                    })
                    continue;
                }
                const check_exixts = await this.projectMasterRepository.findOneBy({
                    title: Like(projectMasterBulkDto[i].title), ps: { id: ps.id }
                });
                if (check_exixts != null) {
                    dupCount++;
                    dupObj.push({
                        title: projectMasterBulkDto[i].title,
                        category: projectMasterBulkDto[i].category
                    });
                    continue;
                }
                const projectMaster = new ProjectMaster();
                projectMaster.title = projectMasterBulkDto[i].title.replace(/\s+/g, '').trim();
                projectMaster.category = projectMasterBulkDto[i].category;
                projectMaster.problemstatement = projectMasterBulkDto[i].problemstatement.trim();
                projectMaster.techstack = projectMasterBulkDto[i].techstack;
                projectMaster.reflink = projectMasterBulkDto[i].reflink || null;
                projectMaster.maxgroups = projectMasterBulkDto[i].maxgroups;
                projectMaster.ps = { id: ps.id } as PsMaster;
                projectMaster.updatedby = reqUsername;
                await this.projectMasterRepository.save(projectMaster);
            }
            logger.debug(`reqUser: ${reqUsername} ProjectMaster bulkCreate service returned with duplicates: [${JSON.stringify(dupObj)}]`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED, payload: { dupObj: dupObj } };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in ProjectMaster bulkCreate service`)
            return { Error: true, message: err_message }
        }
    }

    async createVirtual(reqUsername: string, dummyProjectDto: DummyProjectDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectMaster createVirtual service started`);
            const ps = await this.psMasterRepository.findOne({
                where: {
                    status: PSSType.IN_PROGRESS,
                    college: { id: dummyProjectDto.collegeId },
                    studentyear: dummyProjectDto.studentyear, academicyear: dummyProjectDto.academicyear, semester: dummyProjectDto.semester
                }
            });
            if (ps == null)
                throw `Ps ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`
            const check_exixts = await this.projectMasterRepository.findOneBy({
                title: Like(dummyProjectDto.title), ps: { id: ps.id }
            });
            if (check_exixts != null) {
                throw "Duplicate Project For Ps"
                // dupCount++;
                // dupObj.push({
                //     title: projectMasterBulkDto[i].title,
                //     category: projectMasterBulkDto[i].category
                // });
                // continue;
            }
            const projectMaster = new ProjectMaster();
            projectMaster.title = dummyProjectDto.title.trim();
            projectMaster.category = dummyProjectDto.category || "Virtual";
            projectMaster.problemstatement = dummyProjectDto.problemstatement.trim() || "problemstatement";
            projectMaster.techstack = dummyProjectDto.techstack || "virtual";
            projectMaster.reflink = dummyProjectDto.reflink || null;
            projectMaster.maxgroups = dummyProjectDto.maxgroups;
            projectMaster.ps = { id: ps.id } as PsMaster;
            projectMaster.updatedby = reqUsername;
            await this.projectMasterRepository.save(projectMaster);
            logger.debug(`reqUser: ${reqUsername} ProjectMaster createVirtual service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in ProjectMaster createVirtual service`)
            return { Error: true, message: err_message }
        }
    }

    async getProjectsAndItsMentors(reqUsername: string) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectMaster getProjectsAndItsMentors service started`)
            //fetching the projects and assigned mentors
            const projects = await this.projectMasterRepository.find({
                select: {
                    id: true, title: true, updatedon: true,
                    mentors: { id: true, name: true },
                    ps: {
                        id: true, studentyear: true, semester: true, academicyear: true,
                        college: { id: true, code: true }
                    }
                },
                relations: { mentors: true, ps: { college: true } }
            });
            logger.debug(`reqUser: ${reqUsername} ProjectMaster getProjectsAndItsMentors service returned`)
            return { Error: false, payload: projects }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in ProjectMaster getProjectsAndItsMentors service`)
            return { Error: true, message: err_message };
        }
    }

    async getProjectsAndItsMentorsByPs(reqUser: ReqUserType, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} ProjectMaster getProjectsAndItsMentorsByPs service started`)
            if (reqUser.role == RType.ADMIN) {
                const verify_ps = await this.psMasterRepository.findOne({ where: { id: psId, college: { adminmaster: { usermaster: { id: reqUser.sub } } } } });
                if(verify_ps == null)
                    throw "Admin college is different from PS college";
            }
            //fetching the projects and assigned mentors
            const projects = await this.projectMasterRepository.find({
                where: { status: SType.ACTIVE, ps: { id: psId } },
                select: {
                    id: true, title: true, updatedon: true,
                    mentors: { id: true, name: true, status: true },
                },
                relations: { mentors: true }
            });
            logger.debug(`reqUser: ${reqUser.username} ProjectMaster getProjectsAndItsMentorsByPs service returned`)
            return { Error: false, payload: projects }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in ProjectMaster getProjectsAndItsMentorsByPs service`)
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUsername: string) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectMaster findAll service started`);
            const projects = await this.projectMasterRepository.find({
                select: {
                    id: true, problemstatement: true, maxgroups: true, reflink: true, techstack: true, createdon: true, updatedby: true, updatedon: true, title: true, category: true,
                    groups: { id: true, name: true }, ps: { studentyear: true, academicyear: true, id: true, semester: true, college: { id: true, code: true } }
                },
                relations: { groups: true, ps: { college: true } }
            });
            logger.debug(`reqUser: ${reqUsername} ProjectMaster findAll service returned`);
            return { Error: false, payload: projects }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in ProjectMaster findAll service`)
            return { Error: true, message: err_message };
        }
    }

    async getActiveProjectListByPs(reqUser: ReqUserType, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} ProjectMaster getActiveProjectListByPs service started`)
            if (reqUser.role == RType.STUDENT) {
                const sps = await this.studentPsRepository.findOne({ where: { ps: { id: psId }, student: { usermaster: { id: reqUser.sub } } } });
                if (sps == null)
                    throw "Requested " + ERROR_MESSAGES.USER_NOT_FOUND + " in PS"
            } else if (reqUser.role == RType.ADMIN) {
                const ps = await this.psMasterRepository.findOne({ where: { id: psId, college: { adminmaster: { usermaster: { id: reqUser.sub } } } } });
                if (ps == null)
                    throw "Admin not found for PS"
            }

            const result = await this.projectMasterRepository.find({
                where: { ps: { id: psId } },
                select: { groups: { id: true, name: true }, mentors: { id: true, name: true } },
                relations: { groups: true, mentors: true }
            })
            logger.debug(`reqUser: ${reqUser.username} ProjectMaster getActiveProjectListByPs service returned`)
            return { Error: false, payload: result }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in ProjectMaster getActiveProjectListByPs service`)
            return { Error: true, message: err_message }
        }
    }

    async update(reqUsername: string, updateProjectMasterDto: UpdateProjectMasterDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectMaster update service started`);
            const project = await this.projectMasterRepository.findOneBy({ id: updateProjectMasterDto.id })
            if (!project) {
                // Handle case where the project with the given id is not found
                logger.debug(`reqUser: ${reqUsername} project with id ${updateProjectMasterDto.id} not found.`);
                throw `Project ${ERROR_MESSAGES.NOT_FOUND}`
            }
            project.title = updateProjectMasterDto.title;
            project.category = updateProjectMasterDto.category;
            project.problemstatement = updateProjectMasterDto.problemstatement;
            project.techstack = updateProjectMasterDto.techstack;
            project.reflink = updateProjectMasterDto.reflink || null;
            project.status = updateProjectMasterDto.status;
            project.maxgroups = updateProjectMasterDto.maxgroups;
            project.updatedby = reqUsername;
            const result = await this.projectMasterRepository.save(project);

            logger.debug(`reqUser: ${reqUsername} ProjectMaster update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in ProjectMaster update service`)
            return { Error: true, message: err_message };
        }
    }

    async findAllBycollege(reqUser: ReqUserType, collegeId: number, action: string) {
        try {
            logger.debug(`reqUser: ${reqUser.username} ProjectMaster findAllBycollege service started with arguments clgId:${collegeId},action:${action}`);
            let projects: any;
            if (reqUser.role == RType.ADMIN) {
                const college = await this.collegeRepository.findOne({ where: { id: collegeId, adminmaster: { usermaster: { id: reqUser.sub } } } });
                if (college == null)
                    throw "Admin not found for college"
            }
            if (action == "DASHBOARD") {
                projects = await this.projectMasterRepository.find({
                    where: {
                        ps: {
                            college: {
                                id: collegeId
                            }
                        },
                    },
                    relations: { ps: true }
                });
            } else {
                projects = await this.projectMasterRepository.find({
                    where: {
                        ps: {
                            college: {
                                id: collegeId
                            }
                        },
                    },
                });
            }
            logger.debug(`reqUser: ${reqUser.username} ProjectMaster findAllBycollege service returned`);
            return { Error: false, payload: projects }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in ProjectMaster findAllBycollege service`)
            return { Error: true, message: err_message };
        }
    }

    async assignMentors(reqUsername: string, assignMentorDto: AssignMentorDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectMaster assignMentors service started`);
            //checking projects and mentors are exists or not
            if (assignMentorDto.projectIds.length == 0 || !assignMentorDto.projectIds)
                throw `Projects are Empty`
            const mentorslength = assignMentorDto.mentorIds.length;
            const projectslength = assignMentorDto.projectIds.length;
            const mentorcount = await this.mentorMasterRepository
                .createQueryBuilder('mentor')
                .where('mentor.id IN (:...Ids)', { Ids: assignMentorDto.mentorIds })
                .andWhere('mentor.status =:status', { status: SType.ACTIVE })
                .getCount();
            const projectcount = await this.projectMasterRepository
                .createQueryBuilder('project')
                .where('project.id IN (:...Ids)', { Ids: assignMentorDto.projectIds })
                .andWhere('project.status =:status', { status: SType.ACTIVE })
                .getCount();
            if (mentorcount != mentorslength)
                throw `Mentors ${ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE}`
            if (projectcount != projectslength)
                throw `Projects ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`;

            //checking All projects same college or not and All mentors belong to same college or not
            // let query = `SELECT COUNT(DISTINCT c.id) as num_colleges, MAX(c.id) as college_id FROM project_master p LEFT JOIN ps_master ps ON p.psId = ps.id LEFT JOIN college c ON ps.collegeId = c.id WHERE p.id IN (${assignMentorDto.projectIds})`;
            // const projectclg = await this.projectMasterRepository.query(query);
            // if (projectclg[0].num_colleges != '1')
            //     throw `Projects ${ERROR_MESSAGES.DIFF_COLLEGE}`;

            // query = `SELECT COUNT(DISTINCT c.id) as num_colleges, MAX(c.id) as college_id FROM mentor_master m LEFT JOIN college c ON m.collegeId = c.id WHERE m.id IN (${assignMentorDto.mentorIds})`;
            // const mentorclg = await this.mentorMasterRepository.query(query);

            // if (mentorclg[0].num_colleges != '1')
            //     throw `Mentors ${ERROR_MESSAGES.DIFF_COLLEGE}`
            // if (projectclg[0].college_id != mentorclg[0].college_id)
            //     throw `Mentors and Projects ${ERROR_MESSAGES.DIFF_COLLEGE}`;

            for (let i = 0; i < assignMentorDto.projectIds.length; i++) {
                const project = await this.projectMasterRepository.findOne({
                    where: { id: assignMentorDto.projectIds[i] },
                    relations: { mentors: true }
                })
                if (project == null)
                    continue;
                const updatementors = [...project.mentors]
                assignMentorDto?.mentorIds?.map((id) => (updatementors.push({ id: id } as MentorMaster)));
                project.mentors = updatementors;
                project.updatedby = reqUsername;
                await this.projectMasterRepository.save(project);
            }
            logger.debug(`reqUser: ${reqUsername} ProjectMaster assignMentors service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.ASSIGNED_SUCCESSFULLY };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in ProjectMaster assignMentors service`)
            return { Error: true, message: err_message };
        }
    }

    async editAssignedMentors(reqUsername: string, editAssignMentorDto: EditAssignMentorDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} ProjectMaster editAssignedMentors service started`);
            // checking mentors and project exists or not
            const mentorslength = editAssignMentorDto.mentorIds.length;
            const mentorcount = await this.mentorMasterRepository
                .createQueryBuilder('mentor')
                .where('mentor.id IN (:...Ids)', { Ids: editAssignMentorDto.mentorIds })
                .andWhere('mentor.status=:status', { status: SType.ACTIVE })
                .getCount();
            if (mentorcount != mentorslength)
                throw `Mentors ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`;

            const project = await this.projectMasterRepository.findOne({
                where: { id: editAssignMentorDto.projectId, status: SType.ACTIVE },
                select: { mentors: true, ps: { id: true, college: { id: true } } },
                relations: { mentors: true, ps: { college: true } }
            });
            if (project == null)
                throw `Project ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`


            //checking mentors and project belongs to same college 
            // const query = `SELECT COUNT(DISTINCT c.id) as num_colleges, MAX(c.id) as college_id FROM mentor_master m LEFT JOIN college c ON m.collegeId = c.id WHERE m.id IN (${editAssignMentorDto.mentorIds})`;
            // const mentorclg = await this.mentorMasterRepository.query(query);
            // if (mentorclg[0].num_colleges != '1')
            //     throw `Mentors ${ERROR_MESSAGES.DIFF_COLLEGE}`
            // if (project.ps.college.id != mentorclg[0].college_id)
            //     throw `Mentors and Project ${ERROR_MESSAGES.DIFF_COLLEGE}`;

            //assigning mentors to project
            const updatementors: any[] = []
            editAssignMentorDto?.mentorIds?.map((id) => (updatementors.push({ id: id } as MentorMaster)));
            project.mentors = updatementors;
            await this.projectMasterRepository.save(project);
            logger.debug(`reqUser: ${reqUsername} ProjectMaster editAssignedMentors service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in ProjectMaster editAssignedMentors service`)
            return { Error: true, message: err_message };
        }
    }
}
