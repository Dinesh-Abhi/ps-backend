import { Module } from '@nestjs/common';
import { MentorMasterService } from './mentor-master.service';
import { MentorMasterController } from './mentor-master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorMaster } from './mentor-master.entity';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { CollegeService } from 'src/college/college.service';
import { College } from 'src/college/college.entity';
import { EvaluatorStudentService } from 'src/evaluatorstudent/evaluator-student.service';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { EmailService } from 'src/email/email';
import { StudentPs } from 'src/studentps/studentps.entity';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    MentorMaster, UserMaster, 
    College, EvaluatorStudent, 
    EvaluatorMaster, StudentPs, 
    EvaluationSchedule, GroupMaster
  ])],
  providers: [MentorMasterService, UserMasterService, CollegeService, EvaluatorStudentService, EmailService],
  controllers: [MentorMasterController]
})
export class MentorMasterModule { }
