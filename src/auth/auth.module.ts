import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { HttpModule } from '@nestjs/axios';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from 'src/auditlog/auditlog.entity';
import { Attendance } from 'src/attendance/attendance.entity';
import { AuditLogService } from 'src/auditlog/auditlog.service';
import { UserMasterModule } from 'src/usermaster/user-master.module';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { ProjectProgress } from 'src/projectprogress/project-progress.entity';
import { College } from 'src/college/college.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    UserMasterModule,
    PassportModule,
    HttpModule,
    JwtModule.register({
      secret: "thisisasecretkey",
      signOptions: { expiresIn: '60s' },
    }),
    // CacheModule.registerAsync({
    //   useFactory: () => ({
    //     store: redisStore,
    //     host: 'localhost',
    //     port: 6379,
    //   }),
    // }),
    TypeOrmModule.forFeature([PsMaster, StudentMaster, EvaluatorMaster, AuditLog, GroupMaster, ProjectMaster, MentorMaster, Attendance,ProjectProgress,UserMaster,College,StudentPs]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, TokenService,AuditLogService],
  exports: [AuthService, TokenService,],
  controllers: [AuthController]
})
export class AuthModule { }
