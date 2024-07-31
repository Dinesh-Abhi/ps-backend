import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminMaster } from './admin-master.entity';
import { AdminMasterDto, AdminMasterUpdateDto } from './dto/admin-master.dto';
import logger from 'src/loggerfile/logger';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { PSSType, RType, SType } from 'src/enums';
import { College } from 'src/college/college.entity';
import { CollegeService } from 'src/college/college.service';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { StudentMasterService } from 'src/studentmaster/student-master.service';
import { ProjectMasterService } from 'src/projectmaster/project-master.service';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { ReqUserType } from 'src/all.formats';
import { AttendanceService } from 'src/attendance/attendance.service';
import { ProjectProgressService } from 'src/projectprogress/project-progress.service';

@Injectable()
export class AdminMasterService {
    constructor(
        @InjectRepository(AdminMaster)
        private readonly adminMasterRepository: Repository<AdminMaster>,
        private readonly userMasterService: UserMasterService,
        private readonly collegeService: CollegeService,
        private readonly projectmasterService: ProjectMasterService,
        private readonly studentmasterService: StudentMasterService,
        private readonly projectprogressService: ProjectProgressService,
        private readonly attendanceService: AttendanceService,
        private readonly psmasterService: PsMasterService,
    ) { }

    async create(requser: ReqUserType, adminMasterDto: AdminMasterDto) {
        try {
            logger.debug(`reqUser: ${requser.username} admin create service started`);

            const userdata = { "username": adminMasterDto.username, "password": adminMasterDto.password, "role": RType.ADMIN, "collegeId": adminMasterDto.collegeId };
            logger.debug(`reqUser: ${requser.username} usermaster create service is calling with values > ${JSON.stringify(userdata)}`);
            const user = await this.userMasterService.create(requser.username, userdata);
            logger.debug(`reqUser: ${requser.username} return from usermaster create service > ${JSON.stringify(user)}`)
            if (user.Error)
                throw user.message;

            const adminMaster = new AdminMaster();
            adminMaster.name = adminMasterDto.name;
            adminMaster.usermaster = { id: user.payload.id } as UserMaster;
            adminMaster.college = { id: adminMasterDto.collegeId} as College;
            adminMaster.updatedBy = requser.username;
            await this.adminMasterRepository.save(adminMaster);

            logger.debug(`reqUser: ${requser.username} > admin create service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATE_ASSIGNED_SUCCESSFULLY };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${requser.username} error: ${err_message} > error in create admin service`);
            return { Error: true, message: err_message };
        }
    }

    async update(requser: ReqUserType, adminMasterUpdateDto: AdminMasterUpdateDto) {
        try {
            logger.debug(`reqUser: ${requser.username} admin update service started`);
            const admin = await this.adminMasterRepository.findOne({ where: { id: adminMasterUpdateDto.id } })
            if(admin == null)
                throw ERROR_MESSAGES.USER_NOT_FOUND;
            const clg = await this.collegeService.findOne(requser.username, adminMasterUpdateDto.collegeId);
            if (clg.Error)
                throw clg.message
            if (clg.payload == null || clg.payload.status == SType.INACTIVE)
                throw `College ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`

            admin.name = adminMasterUpdateDto.name;
            admin.college = { id: adminMasterUpdateDto.collegeId } as College;
            admin.updatedBy = requser.username;
            await this.adminMasterRepository.save(admin);
            logger.debug(`reqUser: ${requser.username} admin update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${requser.username} error: ${err_message} > error in admin update service`);
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUsername: string) {
        try {
            logger.debug(`requser: ${reqUsername} admin findAll service started`);
            const result = await this.adminMasterRepository.find({
                select: { name: true, status: true, id: true, college: { id: true, code: true }, usermaster: { id: true, username: true } },
                relations: { college: true, usermaster: true }
            });
            logger.debug(`requser: ${reqUsername} admin findAll service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error: ${err_message} > error in admin findAll service`);
            return { Error: true, message: err_message };
        }
    }

    async getDashboardDetails(reqUser: ReqUserType, clgId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} admin getDashboardDetails service started for clgId: ${clgId}`);
            if (reqUser.role == RType.ADMIN) {
                const admin = await this.adminMasterRepository.findOne({ where: { usermaster: { id: reqUser.sub }, college: { id: clgId } } });
                if (admin == null)
                    throw "Admin not found for college"
            }
            const ps = await this.psmasterService.findAllByCollege(reqUser, clgId);
            const projects = await this.projectmasterService.findAllBycollege(reqUser, clgId, "DASHBOARD");
            const students = await this.studentmasterService.findAllByCollege(reqUser, clgId, "DASHBOARD");
            const project_progress = await this.projectprogressService.findTodayPPByClgId(reqUser.username, clgId)
            const att = await this.attendanceService.getTodayPresent(reqUser.username, clgId);
            let data = {
                activeps: ps.payload?.filter(i => i.status == PSSType.IN_PROGRESS).length || 0,
                activestudents: students.payload?.filter((i) => !i.usermaster.username.toLowerCase().includes('virtualstudent')).length || 0,
                activeprojects: projects.payload?.filter((i) => i.status == SType.ACTIVE && i.ps.status == PSSType.IN_PROGRESS).length || 0,
                tasks_endorsed: project_progress.payload?.filter(i => i.endorsed).length || 0,
                total_tasks: project_progress.payload?.length || 0,
                today_presentcount: parseInt(att.payload[0].present_count) || 0,
            }

            logger.debug(`reqUser: ${reqUser.username} admin getDashboardDetails service returned for clgId: ${clgId}`);
            return { Error: false, payload: data };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUser.username} error: ${err_message} > error in admin getDashboardDetails service`);
            return { Error: true, message: err_message };
        }
    }
}
