import { Module } from '@nestjs/common';
import { PsMasterService } from './ps-master.service';
import { PsMasterController } from './ps-master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PsMaster } from './ps-master.entity';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { StudentPsService } from 'src/studentps/studentps.service';
import { StudentPs } from 'src/studentps/studentps.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { GroupMasterService } from 'src/groupmaster/group-master.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { ProjectMasterService } from 'src/projectmaster/project-master.service';
import { Attendance } from 'src/attendance/attendance.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { EvaluatorStudentService } from 'src/evaluatorstudent/evaluator-student.service';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { EmailService } from 'src/email/email';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PsMaster, College, 
      StudentPs, GroupMaster, 
      EvaluatorMaster, Attendance, 
      StudentMaster, ProjectMaster, 
      MentorMaster, EvaluatorStudent, 
      Milestone, EvaluationSchedule,
      AdminMaster
    ])],
  providers: [PsMasterService, CollegeService, StudentPsService, GroupMasterService, AttendanceService, ProjectMasterService, EvaluatorStudentService, MilestoneService, EmailService, MilestoneService],
  controllers: [PsMasterController]
})
export class PsmasterModule { }
