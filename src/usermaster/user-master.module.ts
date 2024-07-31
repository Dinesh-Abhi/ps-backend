import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMaster } from './user-master.entity';
import { UserMasterController } from './user-master.controller';
import { UserMasterService } from './user-master.service';
import { AuthService } from 'src/auth/auth.service';
import { TokenService } from 'src/auth/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogService } from 'src/auditlog/auditlog.service';
import { AuditLog } from 'src/auditlog/auditlog.entity';
import { EmailService } from 'src/email/email';

@Module({
  imports: [TypeOrmModule.forFeature([UserMaster, AuditLog]), JwtModule],
  controllers: [UserMasterController],
  providers: [UserMasterService, AuthService, TokenService, AuditLogService, EmailService],
  exports: [UserMasterService]
})
export class UserMasterModule { }
