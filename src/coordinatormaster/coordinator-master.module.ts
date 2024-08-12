import { Module } from '@nestjs/common';
import { CoordinatorMasterService } from './coordinator-master.service';
import { CoordinatorMasterController } from './coordinator-master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinatorMaster } from './coordinator-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { EmailService } from 'src/email/email';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoordinatorMaster, UserMaster, StudentMaster, MentorMaster])],
  providers: [CoordinatorMasterService, UserMasterService, EmailService],
  controllers: [CoordinatorMasterController]
})
export class CoordinatorMasterModule { }
