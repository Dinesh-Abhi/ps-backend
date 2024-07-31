import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { PsMasterService } from 'src/psmaster/ps-master.service';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { MilestoneService } from 'src/milestone/milestone.service';
import { Milestone } from 'src/milestone/milestone.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Attendance, AdminMaster,StudentMaster, PsMaster, College, StudentPs, ProjectMaster, GroupMaster, Milestone])],
    controllers: [AttendanceController],
    providers: [AttendanceService, PsMasterService, CollegeService, MilestoneService]
})
export class AttendanceModule {}
