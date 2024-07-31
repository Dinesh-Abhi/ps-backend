import { Module } from '@nestjs/common';
import { EvaluationscheduleService } from './evaluationschedule.service';
import { EvaluationscheduleController } from './evaluationschedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationSchedule } from './evaluationschedule.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';

@Module({
  imports:[TypeOrmModule.forFeature([EvaluationSchedule,AdminMaster])],
  controllers: [EvaluationscheduleController],
  providers: [EvaluationscheduleService]
})
export class EvaluationscheduleModule {}
