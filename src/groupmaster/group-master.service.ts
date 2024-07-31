import { Injectable } from '@nestjs/common';
import { GroupMaster } from './group-master.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignProjectDto, BulkEvaluatorAssignDto, EroleprojectDto, EvaluatorAssignDto, SwapProjectDto, TransferProjectDto, UpdateGroupStatusDto } from './dto/group-master.dto';
import logger from 'src/loggerfile/logger';
import * as path from 'path';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { SType } from 'src/enums';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import * as fs from 'fs';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { ReqUserType } from 'src/all.formats';

@Injectable()
export class GroupMasterService {
    private filepath: string;
    constructor(
        @InjectRepository(GroupMaster)
        private readonly groupRepository: Repository<GroupMaster>,
        @InjectRepository(StudentPs)
        private readonly StudentPsRepository: Repository<StudentPs>,
        @InjectRepository(EvaluatorMaster)
        private readonly evaluatorRepository: Repository<EvaluatorMaster>,
        @InjectRepository(ProjectMaster)
        private readonly projectMasterRepository: Repository<ProjectMaster>,
        @InjectRepository(PsMaster)
        private readonly psMasterRepository: Repository<PsMaster>,
    ) {
        this.filepath = path.basename(__filename);
    }

    // async create(reqUsername: string) {
    //     try {
    //         logger.debug(`reqUser:${reqUsername} group create service started`)
    //         const all_group = await this.groupRepository.findAndCount();
    //         const group = new GroupMaster();
    //         group.name = `G` + `${all_group[1] + 1}`
    //         group.updatedby = reqUsername;
    //         group.createdby = reqUsername;
    //         const res = await this.groupRepository.save(group);
    //         logger.debug(`reqUser:${reqUsername} group create service returned`)
    //         return { Error: false, payload: res };
    //     } catch (error) {
    //         logger.error(`reqUser:${reqUsername} error: ${(typeof error == 'object' ? error.message : error)} > in creating group`)
    //         return { Error: true, message: (typeof error == 'object' ? error.message : error) }
    //     }
    // }

    async projectEnroll(reqUser: ReqUserType, eroleprojectDto: EroleprojectDto) {
        logger.debug(`reqUser:${reqUser.username} groupmaster projectEnroll service started`);
        let group = await this.groupRepository.findOne({
            where: { id: eroleprojectDto.groupId, status: SType.ACTIVE },
            relations: { project: true }
        });
        if (group == null)
            return { Error: true, message: `Group ${ERROR_MESSAGES.NOT_FOUND}` }
        if (group && group?.project != null)
            return { Error: true, message: ERROR_MESSAGES.GROUP_ALREADY_ENROLLED_PROJECT };
        if (!(group.nominee1 === reqUser.username || group.nominee2 === reqUser.username)) {
            return { Error: true, message: "User not a nominee in group" }
        }

        const pdir = path.join(__dirname, '../../public', 'p_lock');
        await fs.promises.mkdir(pdir, { recursive: true });
        const project_file = path.join(pdir, `p-${eroleprojectDto.projectId}.txt`)

        const gdir = path.join(__dirname, '../../public', 'g_lock');
        await fs.promises.mkdir(gdir, { recursive: true });
        const group_file = path.join(gdir, `g-${eroleprojectDto.groupId}.txt`)

        const randomDelay = () => {
            const delayMilliseconds = Math.floor(Math.random() * 10000)
            const delaySeconds = Math.floor(Math.random() * 5) + 1;
            logger.debug(`reqUser:${reqUser.username} groupmaster project enroll dealy time Sec:${delaySeconds}, msec:${delayMilliseconds} `)
            return new Promise(resolve => setTimeout(resolve, (delaySeconds * 1000) + delayMilliseconds));
        };
        await randomDelay();

        try {
            const user = await this.StudentPsRepository.findOne({ where: { status: SType.ACTIVE, group: { id: eroleprojectDto.groupId }, student: { usermaster: { id: reqUser.sub } } } });
            if (user == null)
                throw "Requested user not exists in group";

            const ps = await this.psMasterRepository.findOneBy({ id: eroleprojectDto.psId });
            if (!ps)
                throw `Ps ${ERROR_MESSAGES.NOT_FOUND}`;
            const today = new Date().getTime();
            if (!(new Date(ps.project_start).getTime() <= today)) {
                if (!(today <= new Date(ps.project_end).getTime()))
                    throw ERROR_MESSAGES.PROJECT_ENROLL_END;
                throw ERROR_MESSAGES.PROJECT_ENROLL_NOT_START;
            }

            let project: any = await this.projectMasterRepository.findOne({ where: { id: eroleprojectDto.projectId, status: SType.ACTIVE } });

            if (project == null || project.maxgroups <= project.enrolledgroups)
                throw ERROR_MESSAGES.MAX_ENROLLMENTS;
            if (!fs.existsSync(group_file)) {
                fs.writeFile(group_file, `groupId-${eroleprojectDto.groupId}`, (err) => {
                    if (err) throw err;
                });

                group = await this.groupRepository.findOne({
                    where: { id: eroleprojectDto.groupId },
                    relations: { project: true }
                });
                if (group == null)
                    throw "Group Not Found"
                if (group.project != null) {
                    throw `${ERROR_MESSAGES.GROUP_ALREADY_ENROLLED_PROJECT}`;
                }

                project = await this.projectMasterRepository.findOne({ where: { id: eroleprojectDto.projectId } });

                if (project == null || project.maxgroups <= project.enrolledgroups)
                    throw ERROR_MESSAGES.MAX_ENROLLMENTS;
                // If the file doesn't exist, create it
                if (!fs.existsSync(project_file)) {
                    fs.writeFile(project_file, `projectId-${eroleprojectDto.projectId}`, (err) => {
                        if (err) throw err;
                    });
                    group = await this.groupRepository.findOne({
                        where: { id: eroleprojectDto.groupId },
                        relations: { project: true }
                    });
                    if (group == null)
                        throw "Group Not Found"
                    if (group.project != null) {
                        throw `${ERROR_MESSAGES.GROUP_ALREADY_ENROLLED_PROJECT}`;
                    }
                    project = await this.projectMasterRepository.findOne({ where: { id: eroleprojectDto.projectId } });

                    if (project == null || project.maxgroups <= project.enrolledgroups)
                        throw ERROR_MESSAGES.MAX_ENROLLMENTS;

                    project.enrolledgroups = project.enrolledgroups + 1;
                    project.updatedby = reqUser.username;
                    await this.projectMasterRepository.save(project);

                    group.project = { id: eroleprojectDto.projectId } as ProjectMaster;
                    group.updatedby = reqUser.username;
                    group.project_enrolled = new Date();
                    group.project_enrolledby = reqUser.username;
                    await this.groupRepository.save(group);
                }
                return { Error: false, message: RESPONSE_MESSAGE.PROJECT_ENROLLED + project.title + RESPONSE_MESSAGE.PROJECT_GOODLUCK }
            } else {
                // If project file exists, check if the group is already enrolled or max enrollments reached
                const delayMilliseconds = Math.floor(Math.random() * 10000)
                const delaySeconds = Math.floor(Math.random() * 5) + 1;
                logger.debug(`reqUser:${reqUser.username} project enroll dealy:- ${reqUser.username} delay time ${delaySeconds} ${delayMilliseconds}`)
                // await new Promise(resolve => setTimeout(resolve, (delaySeconds * 1000) + delayMilliseconds));
                group = await this.groupRepository.findOne({
                    where: { id: eroleprojectDto.groupId },
                    relations: { project: true }
                });
                project = await this.projectMasterRepository.findOne({ where: { id: eroleprojectDto.projectId } });
                if (group && group?.project != null)
                    throw ERROR_MESSAGES.GROUP_ALREADY_ENROLLED_PROJECT;
                else if (project && project.maxgroups == project.enrolledgroups)
                    throw ERROR_MESSAGES.MAX_ENROLLMENTS;
                return await this.projectEnroll(reqUser, eroleprojectDto);
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUser.username} error: ${err_message} > error in groupmaster projectEnroll service`);
            return { Error: true, message: err_message };
        } finally {
            if (fs.existsSync(project_file))
                fs.unlink(project_file, (err) => {
                    logger.error(JSON.stringify(err))
                });
            if (fs.existsSync(group_file))
                fs.unlink(group_file, (err) => {
                    logger.error(JSON.stringify(err))
                });
        }
    }

    async findOne(reqUsername: string, gId: number) {
        try {
            logger.debug(`reqUser:${reqUsername} groupmaster findOne service started`);
            const group = await this.groupRepository.findOneBy({ id: gId });
            logger.debug(`reqUser:${reqUsername} groupmaster findOne service returned`);
            return { Error: false, payload: group };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in groupmaster findOne service`);
            return { Error: true, message: err_message };
        }
    }

    async updateStatus(reqUser: ReqUserType, updateGroupStatusDto: UpdateGroupStatusDto) {
        try {
            logger.debug(`reqUser:${reqUser.username} groupmaster updateStatus service started`);
            if (updateGroupStatusDto.status == SType.INACTIVE) {
                const students = await this.StudentPsRepository.find({
                    where: { group: { id: updateGroupStatusDto.id }, status: SType.ACTIVE }
                });
                if (students.length != 0)
                    throw ERROR_MESSAGES.GROUP_INACTIVE;
            }
            await this.groupRepository.update({ id: updateGroupStatusDto.id }, {
                status: updateGroupStatusDto.status,
                updatedby: reqUser.username,
            });
            logger.debug(`reqUser:${reqUser.username} groupmaster updateStatus service returned`)
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUser.username} error: ${err_message} > error in groupmaster updateStatus service`);
            return { Error: true, message: err_message };
        }
    }

    async swapProject(reqUser: ReqUserType, swapProjectDto: SwapProjectDto) {
        try {
            logger.debug(`reqUser:${reqUser.username} groupmaster swapProject service started`);
            let G1project, G2project;
            const Group1 = await this.groupRepository.findOne({ where: { id: swapProjectDto.gId1 }, select: { id: true, project: { id: true } }, relations: { project: true } });
            const Group2 = await this.groupRepository.findOne({ where: { id: swapProjectDto.gId2 }, select: { id: true, project: { id: true } }, relations: { project: true } });
            if (Group1 == null || Group2 == null)
                throw "Group Not Found";
            if (Group1.project == null || Group2.project == null)
                throw `${ERROR_MESSAGES.PROJECT_NOT_FOUND} for group`
            G1project = Group1.project?.id;
            G2project = Group2.project?.id;
            await this.groupRepository.update({ id: swapProjectDto.gId1 }, {
                project: { id: G2project } as ProjectMaster,
                updatedby: reqUser.username,
                project_enrolled: new Date(),
                project_enrolledby: reqUser.username,
            })
            await this.groupRepository.update({ id: swapProjectDto.gId2 }, {
                project: { id: G1project } as ProjectMaster,
                updatedby: reqUser.username,
                project_enrolled: new Date(),
                project_enrolledby: reqUser.username,
            })
            logger.debug(`reqUser:${reqUser.username} groupmaster swapProject service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUser.username} error: ${err_message} > error in groupmaster swapProject service`);
            return { Error: true, message: err_message };
        }
    }

    async transferProject(reqUser: ReqUserType, transferProjectDto: TransferProjectDto) {
        try {
            logger.debug(`reqUser:${reqUser.username} groupmaster transferProject started`);
            let fromGroupProject;
            const fromGroup = await this.groupRepository.findOne({ where: { id: transferProjectDto.fromGroupId }, select: { id: true, project: { id: true } }, relations: { project: true } });
            const toGroup = await this.groupRepository.findOne({ where: { id: transferProjectDto.toGroupId }, select: { id: true, project: { id: true } }, relations: { project: true } });
            if (fromGroup == null || toGroup == null)
                throw "Group Not Found";
            if (fromGroup.project == null)
                throw `${ERROR_MESSAGES.PROJECT_NOT_FOUND} for group`;
            fromGroupProject = fromGroup.project?.id;
            if (toGroup.project != null) {
                const to_group_project = await this.projectMasterRepository.findOneBy({ id: toGroup.project.id });
                if (to_group_project == null)
                    throw "Group Not Found";
                to_group_project.enrolledgroups = to_group_project.enrolledgroups - 1;
                to_group_project.updatedby = reqUser.username;
                await this.projectMasterRepository.save(to_group_project)
            }
            await this.groupRepository.update({ id: transferProjectDto.fromGroupId }, {
                project: null,
                project_enrolled: null,
                project_enrolledby: null,
                updatedby: reqUser.username,
            })
            await this.groupRepository.update({ id: transferProjectDto.toGroupId }, {
                project: { id: fromGroupProject } as ProjectMaster,
                updatedby: reqUser.username,
                project_enrolled: new Date(),
                project_enrolledby: reqUser.username,
            })
            logger.debug(`reqUser:${reqUser.username} groupmaster transferProject returned`);
            return { Error: false, message: RESPONSE_MESSAGE.PROJECT_TRANSFERED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUser.username} error: ${err_message} > error in groupmaster transferProject service`);
            return { Error: true, message: err_message };
        }
    }

    async assignProject(reqUsername: string, assignProjectDto: AssignProjectDto) {
        try {
            logger.debug(`reqUser:${reqUsername} groupmaster assignProject service started`);
            const group = await this.groupRepository.findOne({ where: { id: assignProjectDto.groupId }, relations: { project: true } })
            if (group == null)
                throw ERROR_MESSAGES.GROUP_NOT_FOUND;
            const project = await this.projectMasterRepository.findOneBy({ id: assignProjectDto.projectId });
            if (project == null)
                throw "Project Not Found";
            if (project.maxgroups <= project.enrolledgroups)
                throw ERROR_MESSAGES.MAX_ENROLLMENTS;
            if (group.project != null) {
                const removeproject = await this.projectMasterRepository.findOneBy({ id: group.project.id });
                if (removeproject == null)
                    throw "Project Not Found";
                removeproject.enrolledgroups = removeproject.enrolledgroups - 1;
                removeproject.updatedby = reqUsername;
                await this.projectMasterRepository.save(removeproject);
            }
            project.enrolledgroups = project.enrolledgroups + 1;
            project.updatedby = reqUsername;
            await this.projectMasterRepository.save(project);
            await this.groupRepository.update({ id: assignProjectDto.groupId }, {
                project: { id: project.id } as ProjectMaster,
                updatedby: reqUsername,
                project_enrolled: new Date(),
                project_enrolledby: reqUsername,
            })
            logger.debug(`reqUser:${reqUsername} groupmaster assignProject service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.ASSIGNED_SUCCESSFULLY };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in groupmaster assignProject service`);
            return { Error: true, message: err_message };
        }
    }

    async getGroupsByPs(reqUsername: string, psId: number) {
        try {
            logger.debug(`reqUser:${reqUsername} groupmaster getGroupsByPs service started`);
            const groups = await this.groupRepository.find({
                where: { sps: { ps: { id: psId } } },
                select: { id: true, name: true, status: true },
                relations: { project: true }
            })
            logger.debug(`reqUser:${reqUsername} groupmaster getGroupsByPs service returned`);
            return { Error: false, payload: groups };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in groupmaster getGroupsByPs service`);
            return { Error: true, message: err_message };
        }
    }

    async removeProject(reqUsername: string, groupId: number) {
        try {
            logger.debug(`reqUser:${reqUsername} groupmaster removeProject service started`);
            const group = await this.groupRepository.findOne({
                where: { id: groupId },
                relations: { project: true }
            });
            if (group == null)
                throw ERROR_MESSAGES.GROUP_NOT_FOUND
            if (group.project == null)
                throw ERROR_MESSAGES.GROUP_NOT_ENROLLED_PROJECT
            const project = await this.projectMasterRepository.findOneBy({ id: group.project.id });
            if (project == null)
                throw "Project Not Found";
            await this.projectMasterRepository.update({ id: project.id }, {
                enrolledgroups: project.enrolledgroups - 1,
                updatedby: reqUsername
            });
            await this.groupRepository.update({ id: groupId }, {
                project: null,
                updatedby: reqUsername
            });
            logger.debug(`reqUser:${reqUsername} groupmaster removeProject service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.REMOVED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in groupmaster removeProject service`);
            return { Error: true, message: err_message };
        }
    }
}