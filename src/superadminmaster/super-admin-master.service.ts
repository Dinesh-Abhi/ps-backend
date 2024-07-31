import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdminMaster } from './super-admin-master.entity';
import * as path from 'path';

@Injectable()
export class SuperAdminMasterService {
    private filepath: string;
    constructor(
        @InjectRepository(SuperAdminMaster)
        private readonly superAdminMasterRepository: Repository<SuperAdminMaster>,
    ) {
        this.filepath = path.basename(__filename);
    }
}
