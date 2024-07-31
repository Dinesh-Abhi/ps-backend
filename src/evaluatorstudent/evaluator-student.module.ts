import { Module } from '@nestjs/common';
import { EvaluatorStudentController } from './evaluator-student.controller';
import { EvaluatorStudentService } from './evaluator-student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluatorStudent } from './evaluator-student.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluatorStudent, StudentPs, EvaluatorMaster, EvaluationSchedule, GroupMaster]),
  ],
  controllers: [EvaluatorStudentController],
  providers: [EvaluatorStudentService]
})
export class EvaluatorStudentModule {}
