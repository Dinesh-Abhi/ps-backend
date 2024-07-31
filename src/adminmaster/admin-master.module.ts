import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMaster } from './admin-master.entity';
import { AdminMasterController } from './admin-master.controller';
import { AdminMasterService } from './admin-master.service';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { StudentMasterService } from 'src/studentmaster/student-master.service';
import { ProjectMasterService } from 'src/projectmaster/project-master.service';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { StudentPsService } from 'src/studentps/studentps.service';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { GroupMasterService } from 'src/groupmaster/group-master.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { EvaluatorStudentService } from 'src/evaluatorstudent/evaluator-student.service';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { Attendance } from 'src/attendance/attendance.entity';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { EmailService } from 'src/email/email';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { ProjectProgressService } from 'src/projectprogress/project-progress.service';
import { ProjectProgress } from 'src/projectprogress/project-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminMaster, UserMaster, College, StudentMaster, PsMaster, ProjectMaster, MentorMaster, StudentPs, GroupMaster, EvaluatorMaster, Attendance, EvaluatorStudent, Milestone, EvaluationSchedule, ProjectProgress]),
  ],
  controllers: [AdminMasterController],
  providers: [AdminMasterService, UserMasterService, CollegeService, StudentMasterService, ProjectMasterService, StudentPsService, GroupMasterService, AttendanceService, EvaluatorStudentService, PsMasterService, EmailService, MilestoneService, ProjectProgressService]
})
export class AdminMasterModule { }
