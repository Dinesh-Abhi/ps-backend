import { Module } from '@nestjs/common';
import { CollegeController } from './college.controller';
import { CollegeService } from './college.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { College } from './college.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([College])],
  controllers: [CollegeController],
  providers: [CollegeService],
})
export class CollegeModule { }
