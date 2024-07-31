import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentMaster } from './student-master.entity'
import { StudentMasterController } from './student-master.controller';
import { StudentMasterService } from './student-master.service';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { College } from 'src/college/college.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { Attendance } from 'src/attendance/attendance.entity';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { GroupMasterService } from 'src/groupmaster/group-master.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { ProjectMasterService } from 'src/projectmaster/project-master.service';
import { CollegeService } from 'src/college/college.service';
import { StudentPsService } from 'src/studentps/studentps.service';
import { StudentPs } from 'src/studentps/studentps.entity';
import { EvaluatorStudentService } from 'src/evaluatorstudent/evaluator-student.service';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { EmailService } from 'src/email/email';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentMaster, AdminMaster, PsMaster, UserMaster, College, StudentPs, GroupMaster, Attendance, EvaluatorMaster, ProjectMaster, MentorMaster, EvaluatorStudent, Milestone, EvaluationSchedule])],
  controllers: [StudentMasterController],
  providers: [StudentMasterService, UserMasterService, CollegeService, StudentPsService, AttendanceService, PsMasterService, GroupMasterService, ProjectMasterService, EvaluatorStudentService, EmailService, MilestoneService]
})

export class StudentMasterModule { }
