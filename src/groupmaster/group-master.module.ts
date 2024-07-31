import { Module } from '@nestjs/common';
import { GroupMasterService } from './group-master.service';
import { GroupMasterController } from './group-master.controller';
import { GroupMaster } from './group-master.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { Attendance } from 'src/attendance/attendance.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { ProjectMasterService } from 'src/projectmaster/project-master.service';
import { AttendanceService } from 'src/attendance/attendance.service';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
  imports: [EventEmitter2, TypeOrmModule.forFeature([GroupMaster, AdminMaster, EvaluatorMaster, ProjectMaster, PsMaster, MentorMaster, Attendance, StudentMaster, College, StudentPs, Milestone])],
  providers: [GroupMasterService, ProjectMasterService, PsMasterService, AttendanceService, CollegeService, MilestoneService],
  controllers: [GroupMasterController]
})
export class GroupMasterModule { }
