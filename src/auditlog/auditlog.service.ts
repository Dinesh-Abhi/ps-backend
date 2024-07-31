import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './auditlog.entity';
import { AuditLogDto } from './dto/audit-log.dto';
import logger from 'src/loggerfile/logger';
import * as path from 'path';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { RESPONSE_MESSAGE } from 'src/constants';

@Injectable()
export class AuditLogService {
    private filepath: string;
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) {
        this.filepath = path.basename(__filename);
    }

    async create(reqUsername: string, auditLogDto: AuditLogDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} auditlog create service started with logdetails: ${JSON.stringify(auditLogDto)}`);
            const auditlog = new AuditLog();
            auditlog.action = auditLogDto.action;
            auditlog.info = auditLogDto.info;
            auditlog.usermaster = { id: auditLogDto.userId } as UserMaster;
            await this.auditLogRepository.save(auditlog);
            logger.debug(`reqUser: ${reqUsername} auditlog create service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} > error: ${err_message} > error in creating auditlog service`);
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUsername: string) {
        try {
            logger.debug(`reqUser: ${reqUsername} auditlog findAll service started`);
            const result = await this.auditLogRepository.find({
                relations: { usermaster: true },
                select: {
                    id: true, info: true, createdon: true,
                    usermaster: { id: true, username: true }
                }
            });
            logger.debug(`reqUser: ${reqUsername} auditlog findAll service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in auditlog findAll service`);
            return { Error: true, message: err_message };
        }
    }

    async findOne(auditLogId: number) {
        try {
            logger.debug("auditlog findOne started");
            const result = await this.auditLogRepository.findOneBy({ id: auditLogId });
            logger.debug(`${this.filepath} > returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`${this.filepath} > error: ${err_message} > in findone auditlog`);
            return { Error: true, message: err_message };
        }
    }
}
