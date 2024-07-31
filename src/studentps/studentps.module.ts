import { Module } from '@nestjs/common';
import { StudentPsService } from './studentps.service';
import { StudentPsController } from './studentps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentPs } from './studentps.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { Attendance } from 'src/attendance/attendance.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { GroupMasterService } from 'src/groupmaster/group-master.service';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { ProjectMasterService } from 'src/projectmaster/project-master.service';
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
      StudentPs, GroupMaster,
       Attendance, StudentMaster, 
       PsMaster, College, 
       EvaluatorMaster, ProjectMaster, 
       MentorMaster, EvaluatorStudent, 
       Milestone, EvaluationSchedule,
       AdminMaster,
      ])],
  controllers: [StudentPsController],
  providers: [StudentPsService, AttendanceService, PsMasterService, CollegeService, GroupMasterService, ProjectMasterService, EvaluatorStudentService, MilestoneService, EmailService]
})
export class StudentpsModule { }
