import { Module } from '@nestjs/common';
import { SuperAdminMasterController } from './super-admin-master.controller';
import { SuperAdminMasterService } from './super-admin-master.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminMaster } from './super-admin-master.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperAdminMaster]),
  ],  controllers: [SuperAdminMasterController],
  providers: [SuperAdminMasterService]
})
export class SuperAdminMasterModule {}
