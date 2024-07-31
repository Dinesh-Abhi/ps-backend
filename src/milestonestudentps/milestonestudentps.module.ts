import { Module } from '@nestjs/common';
import { MilestoneStudentPsService } from './milestonestudentps.service';
import { MilestoneStudentPsController } from './milestonestudentps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilestoneStudentPs } from './milestonestudentps.entity';
import { Milestone } from 'src/milestone/milestone.entity';
import { MilestoneService } from 'src/milestone/milestone.service';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { StudentPs } from 'src/studentps/studentps.entity';

@Module({

  imports: [TypeOrmModule.forFeature([MilestoneStudentPs, Milestone, PsMaster, StudentPs])],
  providers: [MilestoneStudentPsService, MilestoneService],
  controllers: [MilestoneStudentPsController]
})
export class MilestonestudentpsModule { }
