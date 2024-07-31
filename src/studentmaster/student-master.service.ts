import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { StudentMaster } from './student-master.entity';
import { CreateVirtualStudentsDto, StudentMasterBulkDto, StudentMasterUpdateDto, StudentProfileUpdateDto } from './dto/student-master.dto';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { ChangePasswordDto, UserMasterDto } from 'src/usermaster/dto/user-master.dto';
import logger from 'src/loggerfile/logger';
import { College } from 'src/college/college.entity';
import { PSSType, RType, SType } from 'src/enums';
import { CollegeService } from 'src/college/college.service';
import { StudentPsService } from 'src/studentps/studentps.service';
import { SPSUpdateDto } from 'src/studentps/dto/student-ps.dto';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import axios from 'axios';
import { ReqUserType } from 'src/all.formats';

@Injectable()
export class StudentMasterService {
    constructor(
        @InjectRepository(StudentMaster)
        private readonly studentMasterRepository: Repository<StudentMaster>,
        @InjectRepository(PsMaster)
        private readonly psMasterRepository: Repository<PsMaster>,
        private readonly userMasterService: UserMasterService,
        private readonly collegeService: CollegeService,
        private readonly studentPsService: StudentPsService,
    ) { }

    async matchStudentRegex(college: string, username: string): Promise<boolean> {
        if (college === 'DEMO' || college === 'TESTCOLLEGE' ) return true;

        const envVariable = `${college}_STUDENT_REGEX`;
        const clgRegex = process.env[envVariable];

        if (!clgRegex) {
            logger.alert(`Please add ${college} student rollno regex in environmental variables as ${envVariable}.`);
            return false;
        }

        const regex = new RegExp(`${clgRegex}`);
        return regex.test(username.toUpperCase());
    }

    async bulkUpload(reqUsername: string, studentMasterBulkDto: StudentMasterBulkDto[]) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentmaster bulkUpload service started`);
            logger.debug(`reqUser: ${reqUsername} finding ps`);
            const college = await this.collegeService.findOne(reqUsername, studentMasterBulkDto[0].collegeId);
            if (college.Error || college.payload == null || college.payload.status == SType.INACTIVE)
                throw `College ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`;
            const ps = await this.psMasterRepository.findOne({
                where: {
                    academicyear: studentMasterBulkDto[0].academicyear,
                    semester: studentMasterBulkDto[0].semester,
                    studentyear: studentMasterBulkDto[0].studentyear,
                    college: {
                        id: studentMasterBulkDto[0].collegeId
                    },
                    status: PSSType.IN_PROGRESS,
                }
            });
            if (ps != null)
                logger.debug(`reqUser: ${reqUsername} finding psId exist`);

            if (ps == null)
                throw `Project School ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`
            let insertedCount = 0
            let updateCount = 0
            let dupCount = 0;
            const dupObj = [], updateObj = []
            for (let i = 0; i < studentMasterBulkDto.length; i++) {

                logger.debug(`reqUser: ${reqUsername} regex check started of college ${college.payload.code} for given student ${studentMasterBulkDto[i].username}`)
                if (!(await this.matchStudentRegex(college.payload.code, studentMasterBulkDto[i].username))) {
                    logger.debug(`reqUser: ${reqUsername} regex check failed of college ${college.payload.code} for given student ${studentMasterBulkDto[i].username}`)
                    logger.error(`reqUser: ${reqUsername} error in bulkuplode ${studentMasterBulkDto[i].username} > message > regex check failed `)
                    dupCount++;
                    dupObj.push({ username: studentMasterBulkDto[i].username, name: studentMasterBulkDto[i].name });
                    continue;
                }
                logger.debug(`reqUser: ${reqUsername} regex check passed of college ${college.payload.code} for given student ${studentMasterBulkDto[i].username}`)

                logger.debug(`reqUser: ${reqUsername} finding student`);
                const student = await this.studentMasterRepository.findOneBy({ usermaster: { username: studentMasterBulkDto[i].username } });
                if (student == null) {
                    //student not exists create student
                    const userMasterDto = new UserMasterDto();
                    userMasterDto.password = studentMasterBulkDto[i].password;
                    userMasterDto.username = studentMasterBulkDto[i].username.toUpperCase();
                    userMasterDto.role = RType.STUDENT;
                    logger.debug(`reqUser: ${reqUsername} create usermaster calling with values ${JSON.stringify(userMasterDto)}`);
                    const usermaster = await this.userMasterService.create(reqUsername, userMasterDto);
                    logger.debug(`reqUser: ${reqUsername} return from usermaster create > ${JSON.stringify(usermaster)}`)
                    if (usermaster.Error) {
                        logger.error(`reqUser: ${reqUsername} error in bulkuplode ${studentMasterBulkDto[i].username} > message >${usermaster.message} `)
                        dupCount++;
                        dupObj.push({ username: studentMasterBulkDto[i].username, name: studentMasterBulkDto[i].name });
                        continue;
                    }

                    const studentMaster = new StudentMaster();
                    studentMaster.name = studentMasterBulkDto[i].name.trim();
                    studentMaster.updatedby = reqUsername;
                    studentMaster.email = studentMasterBulkDto[i].email;
                    studentMaster.college = { id: studentMasterBulkDto[i].collegeId } as College;
                    studentMaster.section = studentMasterBulkDto[i].section;
                    studentMaster.usermaster = { id: usermaster.payload.id } as UserMaster;
                    studentMaster.updatedby = reqUsername
                    const new_student = await this.studentMasterRepository.save(studentMaster)

                    const new_sps = await this.studentPsService.create(new_student.id, ps.id, reqUsername)
                    if (new_sps.Error) {
                        dupCount++;
                        dupObj.push({ username: studentMasterBulkDto[i].username, name: studentMasterBulkDto[i].name });
                        continue;
                    }
                    insertedCount++;
                    // logger.debug(`${this.filepath} > studentMaster saved & returned`);
                } else {
                    if (student.status == SType.INACTIVE) {
                        await this.studentMasterRepository.update({ id: student.id }, {
                            status: SType.ACTIVE,
                            updatedby: reqUsername,
                        });
                    }

                    const changePasswordDto = new ChangePasswordDto()
                    changePasswordDto.password = studentMasterBulkDto[i].password;
                    changePasswordDto.username = studentMasterBulkDto[i].username;
                    logger.debug(`reqUser: ${reqUsername} usermaster updatePasswordByAdmin calling with values ${JSON.stringify(changePasswordDto)}`);
                    const usermasterupdatepass = await this.userMasterService.updatePasswordByAdmin(reqUsername, changePasswordDto);
                    logger.debug(`reqUser: ${reqUsername} return from usermaster updatePasswordByAdmin for user: ${studentMasterBulkDto[i].username} > ${usermasterupdatepass.Error ? `Error: ${usermasterupdatepass.message}` : usermasterupdatepass.message}`)

                    const sps = await this.studentPsService.create(student.id, ps.id, reqUsername)
                    if (sps.Error) {
                        dupCount++;
                        dupObj.push({ username: studentMasterBulkDto[i].username, name: studentMasterBulkDto[i].name });
                        continue;
                    }
                    updateCount++;
                    updateObj.push({ username: studentMasterBulkDto[i].username, name: studentMasterBulkDto[i].name })
                }
            }
            logger.debug(`reqUser: ${reqUsername} studentmaster bulkUpload service returned >  insertedCount: ${insertedCount}, dupCount: ${dupCount}, duplicates: ${JSON.stringify(dupObj)}, updateCount: ${updateCount}, updateObj: ${JSON.stringify(updateObj)}`);
            return {
                Error: false, message: RESPONSE_MESSAGE.CREATE_ASSIGNED_SUCCESSFULLY, payload: { insertedCount: insertedCount, dupCount: dupCount, duplicates: dupObj, updateCount: updateCount }
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in studentmaster bulkUpload service`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUsername: string, updateDto: StudentMasterUpdateDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentmaster update service started`);
            const student = await this.studentMasterRepository.findOne({
                where: { id: updateDto.id }
            });
            if (student == null)
                throw ERROR_MESSAGES.USER_NOT_FOUND

            if (updateDto.new_collegeId == updateDto.old_collegeId && updateDto.new_academicyear == updateDto.old_academicyear && updateDto.new_studentyear == updateDto.old_studentyear && updateDto.new_semester == updateDto.old_semester) {
                const ps = await this.psMasterRepository.findOne({
                    where: {
                        academicyear: updateDto.old_academicyear,
                        studentyear: updateDto.old_studentyear,
                        semester: updateDto.old_semester,
                        college: { id: updateDto.old_collegeId }
                    },
                });
                if (ps == null)
                    throw `Project School ${ERROR_MESSAGES.NOT_FOUND}`
                if (ps && updateDto.status == SType.ACTIVE) {
                    const res = await this.studentPsService.makeSPSActiveByStudentId(reqUsername, updateDto.id, ps.id);
                    if (res.Error)
                        throw res.message
                }
                if (ps && student && updateDto.status == SType.INACTIVE) {
                    const res = await this.studentPsService.makeSPSInactiveByStudentId(reqUsername, updateDto.id, ps.id);
                    if (res.Error)
                        throw res.message
                }
            } else {
                const old_ps = await this.psMasterRepository.findOne({
                    where: {
                        academicyear: updateDto.old_academicyear,
                        studentyear: updateDto.old_studentyear,
                        semester: updateDto.old_semester,
                        college: { id: updateDto.old_collegeId }
                    },
                });
                if (old_ps == null)
                    throw `Project School ${ERROR_MESSAGES.NOT_FOUND}`
                const new_ps = await this.psMasterRepository.findOne({
                    where: {
                        academicyear: updateDto.new_academicyear,
                        studentyear: updateDto.new_studentyear,
                        semester: updateDto.new_semester,
                        college: { id: updateDto.new_collegeId }
                    },
                });
                if (new_ps == null || new_ps.status == PSSType.COMPLETED)
                    throw `Project School ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`

                const spsupdatedto = new SPSUpdateDto();
                spsupdatedto.studentId = student.id;
                spsupdatedto.new_psId = new_ps.id;
                spsupdatedto.old_psId = old_ps.id;
                const res = await this.studentPsService.update(reqUsername, spsupdatedto);
                if (res.Error)
                    throw res.message
            }
            student.name = updateDto.name;
            student.section = updateDto.section;
            student.status = student.status == SType.INACTIVE ? SType.ACTIVE : student.status;
            await this.studentMasterRepository.save(student);
            logger.debug(`reqUser: ${reqUsername} studentmaster update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in studentmaster update service`);
            return { Error: true, message: err_message };
        }
    }

    async createVirtualStudents(reqUsername: string, createVirtualStudentsDto: CreateVirtualStudentsDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentmaster createVirtualStudents service started `);
            const vstudents = [];
            const college = await this.collegeService.findOne(reqUsername, createVirtualStudentsDto.collegeId);
            if (college.Error)
                throw college.message
            if (college.payload == null || college.payload.status == SType.INACTIVE)
                throw new Error("College Not Exists or InActive");
            const ps = await this.psMasterRepository.findOne({
                where: {
                    academicyear: createVirtualStudentsDto.academicyear,
                    semester: createVirtualStudentsDto.semester,
                    studentyear: createVirtualStudentsDto.studentyear,
                    college: {
                        id: createVirtualStudentsDto.collegeId
                    },
                    status: PSSType.IN_PROGRESS
                }
            });
            if (ps == null)
                throw `Project School ${ERROR_MESSAGES.NOT_EXISTS_INACTIVE}`
            const vs_count = await this.studentMasterRepository.findAndCount({
                where: {
                    name: Like("VirtualStudent%")
                }
            });
            for (let i = 0; i < createVirtualStudentsDto.noofstudents; i++) {
                const vsname = `VirtualStudent${vs_count[1] + i + 1}`.trim().toUpperCase();
                vstudents.push(vsname);
                const userMasterDto = new UserMasterDto();
                userMasterDto.password = uuidv4();
                userMasterDto.username = vsname
                userMasterDto.role = RType.STUDENT;
                logger.debug(`reqUser: ${reqUsername} create usermaster calling with value ${JSON.stringify(userMasterDto)}`);
                const user = await this.userMasterService.create(reqUsername, userMasterDto);
                logger.debug(`reqUser: ${reqUsername} returned from usermaster create`)
                if (user.Error)
                    throw user.message;
                const studentMaster = new StudentMaster();
                studentMaster.name = vsname;
                studentMaster.college = { id: college.payload.id } as College;
                studentMaster.section = "Virtual Section";
                studentMaster.usermaster = { id: user.payload.id } as UserMaster;
                studentMaster.updatedby = reqUsername;
                const student = await this.studentMasterRepository.save(studentMaster);
                const sps = await this.studentPsService.create(student.id, ps.id, reqUsername)
                if (sps.Error)
                    throw sps.message
            }
            logger.debug(`reqUser: ${reqUsername} studentmaster createVirtualStudents service returned `);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED, payload: vstudents }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in studentmaster createVirtualStudents service`);
            return { Error: true, message: err_message };
        }

    }
    async findAllByPs(reqUser: ReqUserType, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentmaster findAllByPs service started`);
            if (reqUser.role == RType.ADMIN) {
                const ps = await this.psMasterRepository.findOne({ where: { id: psId, college: { adminmaster: { usermaster: { id: reqUser.sub } } } } });
                if (ps == null)
                    throw "Admin not found for PS"
            }
            const ps = await this.psMasterRepository.findOne({ where: { id: psId }, relations: { college: true } });
            if (ps == null)
                throw new Error("Ps Not Found");

            const students: any = await this.studentMasterRepository.find({
                where: {
                    studentps: { ps: { id: psId } }
                },
                select: {
                    id: true, name: true, section: true, email: true,
                    college: { id: true, code: true },
                    usermaster: { id: true, username: true },
                    studentps: {
                        id: true, status: true, reviewcomments: true,
                        group: { id: true, name: true, project: { id: true, title: true, category: true, problemstatement: true, reflink: true, techstack: true, mentors: { id: true, name: true } } },
                        es: { id: true, type: true, evaluator: { id: true, name: true }, evaluationschedule: { id: true, name: true, start: true, end: true } }
                    }
                },
                relations: { college: true, usermaster: true, studentps: { group: { project: { mentors: true } }, es: { evaluationresult: true, evaluationschedule: true, evaluator: true } } }
            });
            logger.debug(`reqUser: ${reqUser.username} studentmaster findAllByPs service returned`);
            return { Error: false, payload: students, college: ps.college.name }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in studentmaster findAllByPs service`);
            return { Error: true, message: err_message };
        }
    }

    async findAllByCollege(reqUser: ReqUserType, clgId: number, action: string) {
        try {
            logger.debug(`requser: ${reqUser.username} studentmaster findAllByCollege service started with arguments: collegeId:${clgId},action:${action}`);
            let students: any;
            if (action == "DASHBOARD") {
                students = await this.studentMasterRepository.find({
                    where: { college: { id: clgId, adminmaster: { usermaster: { id: reqUser.sub } } }, studentps: { status: SType.ACTIVE } },
                    relations: { usermaster: true, studentps: true }
                });
            } else
                students = await this.studentMasterRepository.find({
                    where: { college: { id: clgId, adminmaster: { usermaster: { id: reqUser.sub } } } },
                });
            logger.debug(`requser: ${reqUser.username} studentmaster findAllByCollege service returned > students_count:${students.length} `);
            return { Error: false, payload: students }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in studentmaster findAllByCollege service`);
            return { Error: true, message: err_message };
        }
    }

    async studentProfileUpdate(reqUser: ReqUserType, studentProfileUpdateDto: StudentProfileUpdateDto) {
        try {
            logger.debug(`reqUser: ${reqUser.username} studentmaster studentProfileUpdate service started`);
            const student = await this.studentMasterRepository.findOneBy({ id: studentProfileUpdateDto.studentId, status: SType.ACTIVE, usermaster: { id: reqUser.sub } });
            if (student) {
                await this.studentMasterRepository.update({ id: studentProfileUpdateDto.studentId }, {
                    name: studentProfileUpdateDto.name,
                    email: studentProfileUpdateDto.email,
                    updatedby: reqUser.username
                })
            } else
                throw ERROR_MESSAGES.USER_NOT_FOUND;
            logger.debug(`reqUser: ${reqUser.username} studentmaster studentProfileUpdate service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in studentmaster studentProfileUpdate service`);
            return { Error: true, message: err_message };
        }
    }

    //dont change this code
    async syncSection(reqUsername: string, clgId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} studentmaster syncSection service started`);
            const college = await this.collegeService.findOne(reqUsername, clgId);
            if (college.Error) {
                throw "Error occured during sync sections";
            } else if (college.payload == null) {
                throw `College ${ERROR_MESSAGES.RECORD_NOT_FOUND}`
            }

            const students = await this.studentMasterRepository.find({
                where: { college: { id: clgId } },
                relations: { usermaster: true },
                select: { id: true, usermaster: { username: true } }
            });
            if (students.length == 0)
                throw "No students to sync";
            const student_roll = []
            for (let i = 0; i < students.length; i++) {
                student_roll.push({ "htno": students[i].usermaster.username })
            }
            const send_data = JSON.stringify({
                "method": 3320,
                "students": student_roll    //[{"htno":"22BD1A051T"}]
            })
            if (student_roll.length == 0) {
                throw "Students not found";
            }

            if (college.payload.code !== "KMCE") {
                let get_data = null
                if (college.payload.code == "KMIT") {
                    get_data = await axios.post(`${process.env.KMIT_TRINETRA_URL}`, send_data)
                } else if (college.payload.code == "NGIT") {
                    get_data = await axios.post(`${process.env.NGIT_TRINETRA_URL}`, send_data)
                } else if (college.payload.code == "KMEC") {
                    get_data = await axios.post(`${process.env.KMEC_TRINETRA_URL}`, send_data)
                }

                logger.debug(`reqUser: ${reqUsername} sync sections requested data:${JSON.stringify(send_data)} and response: ${get_data} response data: ${JSON.stringify(get_data?.data)}`)
                if (get_data?.data == null || get_data?.data.length == 0) {
                    logger.debug(`reqUser: ${reqUsername} studentmaster syncSection service returned as error, because the response data is null from trinetra server`);
                    return { Error: true, message: "Users not found in server" };
                }

                for (let j = 0; j < get_data.data.length; j++) {
                    const s = await this.studentMasterRepository.findOneBy({ usermaster: { username: get_data.data[j].htno } });
                    if (s == null)
                        continue;
                    s.section = `${get_data.data[j].branch}-${get_data.data[j].section}`;
                    s.updatedby = reqUsername;
                    await this.studentMasterRepository.save(s);
                }

                logger.debug(`reqUser: ${reqUsername} studentmaster syncSection service returned`);
                return { Error: false, message: "Sync completed successfully" }
            } else {
                logger.alert(`reqUser: ${reqUsername} please male sure KMCE_TRINETRA_URL details present in environmental variable to sync sections`)
                throw "Unable to sync sections"
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in studentmaster syncSection service`);
            return { Error: true, message: err_message };
        }
    }
}
