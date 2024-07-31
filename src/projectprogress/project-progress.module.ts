import { Module } from '@nestjs/common';
import { ProjectProgressService } from './project-progress.service';
import { ProjectProgressController } from './project-progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectProgress } from './project-progress.entity';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { Attendance } from 'src/attendance/attendance.entity';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectProgress, AdminMaster,Attendance, StudentMaster, PsMaster, College, StudentPs, ProjectMaster, GroupMaster, Milestone])],
  providers: [ProjectProgressService, AttendanceService, PsMasterService, CollegeService, MilestoneService],
  controllers: [ProjectProgressController]
})
export class ProjectProgressModule { }
