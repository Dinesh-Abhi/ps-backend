import { Injectable } from '@nestjs/common';
import { Attendance } from './attendance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import logger from 'src/loggerfile/logger';
import * as path from 'path';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { AttendanceEnum, RType } from 'src/enums';
import { StudentPs } from 'src/studentps/studentps.entity';
import { BulkMarkAttendanceDto } from './dto/attendance.dto';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { ReqUserType } from 'src/all.formats';
import { PsMaster } from 'src/psmaster/ps-master.entity';

@Injectable()
export class AttendanceService {
    private filepath: string;
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        @InjectRepository(StudentPs)
        private readonly studentPsRepository: Repository<StudentPs>,
        @InjectRepository(PsMaster)
        private readonly psMasterRepository: Repository<PsMaster>,
        private readonly psMasterService: PsMasterService,
    ) {
        this.filepath = path.basename(__filename);
    }

    async bulkMarkAttendance(reqUser: ReqUserType, bulkMarkAttendanceDto: BulkMarkAttendanceDto[]) {
        try {
            // this method is used to bulk mark attendance for student
            logger.debug(`reqUser: ${reqUser.username} Attendance bulkMarkAttendance service started`);
            const curr_time = new Date().getHours();
            if (!(curr_time >= 10 && curr_time < 18)) {
                logger.debug(`reqUser: ${reqUser.username} marking attendance not started yet or time out`)
                throw ERROR_MESSAGES.ATTENDANCE_START_END
            }
            const dup = []
            for (let i = 0; i < bulkMarkAttendanceDto.length; i++) {
                const student = await this.studentPsRepository
                    .createQueryBuilder('sps')
                    .innerJoin('sps.student', 's')
                    .innerJoin('s.usermaster', 'u')
                    .where('sps.id=:spsId', { spsId: bulkMarkAttendanceDto[i].spsId })
                    .select('u.username as username')
                    .getRawOne()
                if (bulkMarkAttendanceDto[i].projectId !== null) {
                    const verify_sps = await this.studentPsRepository.findOne({
                        where: {
                            id: bulkMarkAttendanceDto[i].spsId,
                            group: {
                                project: {
                                    id: bulkMarkAttendanceDto[i].projectId,
                                    mentors: { usermaster: { id: reqUser.sub } }
                                }
                            }
                        }
                    })
                    if (verify_sps === null) {
                        dup.push({
                            user: student.username,
                            error: 'Student Not found for Project'
                        })
                        continue
                    }
                }
                const res = await this.markattendance(reqUser.username, bulkMarkAttendanceDto[i].spsId, bulkMarkAttendanceDto[i].attendance);
                if (res.Error) {
                    dup.push({
                        user: student.username,
                        error: res.message
                    })
                }
            }
            logger.debug(`bulkMarkAttendance requested by ${reqUser.username} requested_count:${bulkMarkAttendanceDto.length},marked_count:${bulkMarkAttendanceDto.length - dup.length}, error_count:${dup.length}`)
            logger.debug(`reqUser: ${reqUser.username} attendance bulkMarkAttendance service returned and duplicate are :- ${JSON.stringify(dup)}`)
            const res = `${RESPONSE_MESSAGE.ATTENDANCES_SUCCESS} and the attendance will be synced to Netra at the following times: 3:30, 4:30, 5:30, and 6:30.`;
            return { Error: false, message: res, payload: { dup: dup, marked_count: (bulkMarkAttendanceDto.length - dup.length) } };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in attendance bulkMarkAttendance service`);
            return { Error: true, message: err_message };
        }
    }

    async markattendance(reqUsername: string, spsId: number, att: AttendanceEnum) {
        try {
            // this method is used to mark attendance for student
            logger.debug(`reqUser: ${reqUsername} Attendance markattendance service started for spsId:${spsId},attendance:${att}`);
            const curr_date = new Date();
            curr_date.setUTCHours(0, 0, 0, 0);
            const sps = await this.studentPsRepository
                .createQueryBuilder('sps')
                .innerJoin('sps.student', 's')
                .innerJoin('s.usermaster', 'u')
                .where('sps.id=:spsId', { spsId })
                .select('u.username as username')
                .getRawOne()
            if (sps == null)
                throw new Error("StudentPs Not Found")
            logger.debug(`Attendance requested by: ${reqUsername} of student : ${sps.username}  attendance : ${att}`)

            let attendance: any = await this.attendanceRepository.findOne({
                where: {
                    sps: { id: spsId },
                    createdon: MoreThanOrEqual(curr_date),
                }
            });
            if (attendance != null) {
                attendance.attendance = att;
                attendance.updatedby = reqUsername;
                await this.attendanceRepository.save(attendance);
                logger.debug(`Attendance successfully updated by: ${reqUsername} of student : ${sps.username} attendance : ${att}`)
            } else {
                attendance = new Attendance();
                attendance.attendance = att;
                attendance.updatedby = reqUsername;
                attendance.date = new Date();
                attendance.sps = { id: spsId } as StudentPs;
                await this.attendanceRepository.save(attendance);
                logger.debug(`Attendance successfully inserted by: ${reqUsername} for student : ${sps.username} attendance : ${att}`)
            }
            logger.debug(`reqUser: ${reqUsername} > Attendance markattendance service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.ATTENDANCE_SUCCESS };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in attendance markattendance`);
            return { Error: true, message: err_message };
        }
    }

    async getTotalAttendance(reqUsername: string, spsId: number) {
        try {
            //this method is used to get student attendance using student an ps Id's and calculate attendance percentage
            logger.debug(`reqUser: ${reqUsername} Attendance getTotalAttendance service started for spsId:${spsId}`);
            const totalattendance = await this.attendanceRepository.
                createQueryBuilder('a')
                .select('COUNT(*)', 'totalDays')
                .addSelect(`COALESCE(SUM(CASE WHEN a.attendance = '${AttendanceEnum.PRESENT}' THEN 1 ELSE 0 END), 0) AS totalPresentDays`)
                .where('a.spsId=:spsId', { spsId })
                .getRawOne();
            if (totalattendance.totalDays == 0)
                return { Error: false, payload: 0 };
            const att = Math.round(totalattendance.totalPresentDays / totalattendance.totalDays * 100);
            logger.debug(`reqUser: ${reqUsername} Attendance getTotalAttendance service returned for spsId:${spsId}`);
            return { Error: false, payload: att };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} spsId:${spsId} error: ${err_message} > error in Attendance getTotalAttendance service`);
            return { Error: true, message: err_message };
        }
    }

    async getTodayPresent(reqUsername: string, clgId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} Attendance getTodayPresent service started for clgId:${clgId}`);
            const query = `select COALESCE(count(a.id), 0) as present_count from attendance a join student_ps sps on sps.id = a.spsId join student_master s on s.id = sps.studentId where sps.status = 'ACTIVE' and s.collegeId = ${clgId} and a.attendance = 'PRESENT' AND date(a.createdon) = curdate(); `
            const attendance = await this.attendanceRepository.query(query)
            logger.debug(`reqUser: ${reqUsername} Attendance getTodayPresent service returned for clgId:${clgId}`);
            return { Error: false, payload: attendance };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} clgId:${clgId} error: ${err_message} > error in Attendance getTodayPresent service`);
            return { Error: true, message: err_message };
        }
    }

    async getAllStudentsAttendance(reqUser: ReqUserType, psId: number) {
        try {
            logger.debug(`reqUser: ${reqUser.username} Attendance getAllStudentsAttendance service started for psId:${psId}`);
            if (reqUser.role = RType.ADMIN) {
                const verify_ps = await this.psMasterRepository.findOne({ where: { id: psId, college: { adminmaster: { usermaster: { id: reqUser.sub } } } } });
                if (verify_ps == null)
                    throw "Admin college is different from PS college";
            }
            const query = `SELECT u.username AS 'rollno', s.name AS name, s.section AS section, COALESCE( attendance.totalPresentDays, 0) as presentdays, COALESCE( ROUND( ( attendance.totalPresentDays / attendance.totaldays * 100 ), 2 ), 0) AS attendance FROM student_ps sps JOIN student_master s ON s.id = sps.studentId JOIN user_master u ON s.usermasterId = u.id LEFT JOIN( SELECT spsId, COALESCE( SUM( CASE WHEN attendance = 'PRESENT' THEN 1 ELSE 0 END ), 0 ) AS totalPresentDays, COUNT(id) AS totaldays FROM attendance GROUP BY spsId ) AS attendance ON attendance.spsId = sps.id WHERE sps.psId = ${psId} AND u.username NOT LIKE('VIRTUAL%') ORDER BY 'rollno' ASC;`
            const attendance = await this.studentPsRepository.query(query)
            logger.debug(`reqUser: ${reqUser.username} Attendance getAllStudentsAttendance service returned for psId:${psId}`);
            return { Error: false, payload: attendance };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} psId:${psId} error: ${err_message} > error in Attendance getAllStudentsAttendance service`);
            return { Error: true, message: err_message };
        }
    }

    async checkTodayWorkingDayForPs(psId: number) {
        logger.debug(`Attendance checkTodayWorkingDay started`);
        // this methed is used to find current tuple is today or not if it is today's tuple we are asuming that today is working day
        const res = await this.attendanceRepository.findOne({
            where: { sps: { ps: { id: psId } } },
            order: { createdon: 'DESC' },
            select: { id: true, createdon: true },
        });
        if (res == null)
            return false
        const res_Date = new Date(res.createdon);
        const curr_date = new Date();
        logger.debug(`${this.filepath} > returned`)
        return (
            res_Date.getFullYear() === curr_date.getFullYear() &&
            res_Date.getMonth() === curr_date.getMonth() &&
            res_Date.getDate() === curr_date.getDate()
        );
    }

    async markAbsentAttendanceAtEndOfDayCornJob() {
        try {
            // this method is used to mark attendance for student how are absent or not endorsed on that day 
            const curr_Date = new Date();
            logger.debug(`reqUser: Cron Attendance markAbsentAttendanceAtEndOfDayCornJob started`);
            const curr_pss = await this.psMasterService.findAllWorkingPs("Cron");
            if (curr_pss.Error)
                throw curr_pss.message
            if (curr_pss.payload == null || curr_pss.payload.length == 0)
                throw new Error("Current Working Ps's Not Found")

            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const attendance_Ids = await this.attendanceRepository.find({
                where: { attendance: In([AttendanceEnum.PRESENT, AttendanceEnum.ABSENT]), createdon: MoreThanOrEqual(today) },
                relations: { sps: true },
                select: { id: true, sps: { id: true } }
            });
            const markedstudents = attendance_Ids.length != 0 ? attendance_Ids?.map((att) => att.sps.id) : []
            const markabsentlist = []
            for (let i = 0; i < curr_pss.payload.length; i++) {
                const working = await this.checkTodayWorkingDayForPs(curr_pss.payload[i]);
                if (working) {
                    // fetching the ps students
                    logger.debug(`reqUser: Cron Today is Working day for psId:${curr_pss.payload[i]}`)
                    let students: any = await this.psMasterService.getPsStudents("Cron", curr_pss.payload[i]);
                    if (students.Error)
                        throw students.message
                    if (students.payload.length == 0)
                        throw "Students not found"
                    students = await students.payload?.flatMap((ps: any) => ps?.studentps?.map((sps: any) => sps?.id)) || []
                    if (students.length == 0)
                        throw new Error("Students Not Found In Ps")
                    for (let i = 0; i < students.length; i++) {
                        if (!markedstudents.includes(students[i])) {
                            markabsentlist.push(students[i])
                            await this.markattendance("Cron", students[i], AttendanceEnum.ABSENT)
                        }
                    }
                } else {
                    logger.debug(`reqUser: Cron Today is not Working day for psId:${curr_pss.payload[i]}`)
                }
            }
            logger.debug(`reqUser: Cron today_mentor_marked_students:[${markedstudents}], today_Cron_marked_students:[${markabsentlist}]`)
        } catch (error) {
            logger.error(`reqUser: Cron error: ${(typeof error == 'object' ? error.message : error)} > error in markAbsentAttendanceAtEndOfDayCornJob Attendance`);
        } finally {
            logger.debug("Cron markAbsentAttendanceAtEndOfDayCornJob completed")
        }
    }
}