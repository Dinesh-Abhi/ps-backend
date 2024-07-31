import { Module } from '@nestjs/common';
import { ProjectMasterService } from './project-master.service';
import { ProjectMasterController } from './project-master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMaster } from './project-master.entity';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { Attendance } from 'src/attendance/attendance.entity';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMaster, AdminMaster, PsMaster, MentorMaster, Attendance, StudentMaster, College, StudentPs, GroupMaster, Milestone])],
  providers: [ProjectMasterService, PsMasterService, AttendanceService, CollegeService, MilestoneService],
  controllers: [ProjectMasterController]
})
export class ProjectMasterModule { }
