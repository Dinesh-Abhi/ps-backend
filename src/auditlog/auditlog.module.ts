import { Module } from '@nestjs/common';
import { AuditLogController } from './auditlog.controller';
import { AuditLogService } from './auditlog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './auditlog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogController],
  providers: [AuditLogService]
})
export class AuditLogModule {}
