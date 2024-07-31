import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserMasterModule } from './usermaster/user-master.module';
import { StudentMasterModule } from './studentmaster/student-master.module';
import { AdminMasterModule } from './adminmaster/admin-master.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtExpiredFilter } from './auth/jwtExpired.filter';
import { MysqlModule } from './config/mysql/mysql.module';
import { MysqlService } from './config/mysql/mysql.service';
import { MysqlDatabaseProviderModule } from './config/mysql/provider.module';
import { ConfigAppModule } from './config/config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CollegeModule } from './college/college.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminMaster } from './adminmaster/admin-master.entity';
import { UserMaster } from './usermaster/user-master.entity';
import { JwtService } from '@nestjs/jwt';
import { AuditLogModule } from './auditlog/auditlog.module';
import { AuditLog } from './auditlog/auditlog.entity';
import { SuperAdminMasterModule } from './superadminmaster/super-admin-master.module';
import { MentorMasterModule } from './mentormaster/mentor-master.module';
import { EvaluatorMasterModule } from './evaluatormaster/evaluator-master.module';
import { PsmasterModule } from './psmaster/ps-master.module';
import { ProjectMasterModule } from './projectmaster/project-master.module';
import { GroupMasterModule } from './groupmaster/group-master.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CoordinatorMasterModule } from './coordinatormaster/coordinator-master.module';
import { EvaluatorResultsModule } from './evaluationresults/evaluation-results.module';
import { ProjectProgressModule } from './projectprogress/project-progress.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { College } from './college/college.entity';
import { PsMaster } from './psmaster/ps-master.entity';
import { ProjectMaster } from './projectmaster/project-master.entity';
import { ProjectProgress } from './projectprogress/project-progress.entity';
import { MentorMaster } from './mentormaster/mentor-master.entity';
import { EvaluatorMaster } from './evaluatormaster/evaluator-master.entity';
// import { EvaluationGroupResults } from './evaluationresults/evaluation-group-result.entity';
// import { EvaluationStudentResults } from './evaluationresults/evaluation-results.entity';
import { SuperAdminMaster } from './superadminmaster/super-admin-master.entity';
import { GroupMaster } from './groupmaster/group-master.entity';
import { CoordinatorMaster } from './coordinatormaster/coordinator-master.entity';
import { Attendance } from './attendance/attendance.entity';
import { EvaluatorStudentModule } from './evaluatorstudent/evaluator-student.module';
import { StudentpsModule } from './studentps/studentps.module';
import { StudentPs } from './studentps/studentps.entity';
import { MilestoneModule } from './milestone/milestone.module';
import { Milestone } from './milestone/milestone.entity';
import { MilestonestudentpsModule } from './milestonestudentps/milestonestudentps.module';
import { MilestoneStudentPs } from './milestonestudentps/milestonestudentps.entity';
import { EvaluationSchedule } from './evaluationschedule/evaluationschedule.entity';
import { EvaluationscheduleModule } from './evaluationschedule/evaluationschedule.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 5, // 5 seconds
      limit: 60, // 60 requests per ttl period
    }),
    TypeOrmModule.forFeature([AdminMaster, UserMaster, College, AuditLog, PsMaster, ProjectMaster, ProjectProgress, MentorMaster, EvaluatorMaster,EvaluationSchedule, SuperAdminMaster, GroupMaster, CoordinatorMaster, Attendance, StudentPs, Milestone, MilestoneStudentPs]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigAppModule, // Use the ConfigModule
    MysqlDatabaseProviderModule,
    UserMasterModule,
    StudentMasterModule,
    AdminMasterModule,
    AuthModule,
    TypeOrmModule,
    MysqlModule,
    CollegeModule,
    AuditLogModule,
    SuperAdminMasterModule,
    MentorMasterModule,
    EvaluatorMasterModule,
    PsmasterModule,
    ProjectMasterModule,
    GroupMasterModule,
    AttendanceModule,
    CoordinatorMasterModule,
    EvaluatorResultsModule,
    ProjectProgressModule,
    WatchlistModule,
    EvaluatorStudentModule,
    StudentpsModule,
    MilestoneModule,
    MilestonestudentpsModule,
    EvaluatorStudentModule,
    EvaluationscheduleModule,
  ],
  controllers: [AppController],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: JwtExpiredFilter,
    },
    AppService, MysqlService, JwtService]
})
export class AppModule { }
