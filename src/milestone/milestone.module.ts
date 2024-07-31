import { Module } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { MilestoneController } from './milestone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Milestone } from './milestone.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Milestone, PsMaster])],
  providers: [MilestoneService],
  controllers: [MilestoneController]
})
export class MilestoneModule { }
