import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluatorMasterService } from './evaluator-master.service';
import { EvaluatorMasterController } from './evaluator-master.controller';
import { EvaluatorMaster } from './evaluator-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { StudentPsService } from 'src/studentps/studentps.service';
import { StudentPs } from 'src/studentps/studentps.entity';
import { GroupMasterService } from 'src/groupmaster/group-master.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { ProjectMasterService } from 'src/projectmaster/project-master.service';
import { Attendance } from 'src/attendance/attendance.entity';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { EvaluatorStudentService } from 'src/evaluatorstudent/evaluator-student.service';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { EmailService } from 'src/email/email';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EvaluatorMaster, UserMaster,
            StudentMaster, StudentPs,
            GroupMaster, Attendance,
            ProjectMaster, PsMaster,
            MentorMaster, College,
            EvaluatorStudent, Milestone,
            EvaluationSchedule, AdminMaster,
        ])],
    providers: [EvaluatorMasterService, UserMasterService, StudentPsService, GroupMasterService, AttendanceService, ProjectMasterService, PsMasterService, CollegeService, EvaluatorStudentService, EmailService, MilestoneService],
    controllers: [EvaluatorMasterController]
})
export class EvaluatorMasterModule { }
