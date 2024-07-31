import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from './college.entity';
import { CollegeDto, UpdateCollegeDto } from './dto/college.dto';
import logger from 'src/loggerfile/logger';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { PSSType, SType } from 'src/enums';

@Injectable()
export class CollegeService {
    constructor(
        @InjectRepository(College)
        private readonly collegeRepository: Repository<College>,
    ) { }

    async create(reqUsername: string, collegeDto: CollegeDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} college create started`);
            const college = new College();
            college.code = collegeDto.code;
            college.name = collegeDto.name;
            college.updatedby = reqUsername;

            await this.collegeRepository.save(college);
            logger.debug(`reqUser: ${reqUsername} > college saved & returned`);
            return { Error: false, message: RESPONSE_MESSAGE.CREATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} > ${err_message} > in creating college`);
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUsername: string) {
        try {
            logger.debug(`reqUser: ${reqUsername} college findAll service started`);
            const result = await this.collegeRepository.find();
            logger.debug(`reqUser: ${reqUsername} college findAll service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in findAll service college`);
            return { Error: true, message: err_message };
        }
    }

    async findOne(reqUsername: string, clgId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} college findOne service started`);
            const result = await this.collegeRepository.findOneBy({ id: clgId });
            logger.debug(`reqUser: ${reqUsername} college findOne service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in college findOne service`);
            return { Error: true, message: err_message };
        }
    }

    async update(reqUsername: string, updateCollegeDto: UpdateCollegeDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} college update service started`);
            const college = await this.collegeRepository.findOneBy({ id: updateCollegeDto.id });
            if (!college) {
                // Handle case where the College with the given id is not found
                logger.debug(`reqUser: ${reqUsername} > college with id ${updateCollegeDto.id} not found.`);
                throw `College ${ERROR_MESSAGES.NOT_FOUND}`;
            }
            college.code = updateCollegeDto.code || college.code;
            college.name = updateCollegeDto.name || college.name;
            college.updatedby = reqUsername;
            college.status = updateCollegeDto.status;
            if (updateCollegeDto.status == SType.INACTIVE) {
                const res = await this.inActiveAllRelations(reqUsername, college.id);
                if (res.Error)
                    throw res.message
            }
            await this.collegeRepository.save(college);
            logger.debug(`reqUser: ${reqUsername} college update service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in college update service`);
            return { Error: true, message: err_message };
        }
    }

    async inActiveAllRelations(reqUsername: string, collegeId: number) {
        try {
            logger.debug(`reqUser: ${reqUsername} college inActiveAllRelations service started`);
            await this.collegeRepository.query(`
            UPDATE
                college clg
            JOIN admin_master a ON
                a.collegeId = clg.id
            JOIN coordinator_master c ON
                c.collegeId = clg.id
            JOIN mentor_master m ON
                m.collegeId = clg.id
            JOIN student_master s ON
                s.collegeId = clg.id
            JOIN ps_master ps ON
                ps.collegeId = clg.id
            JOIN student_ps sps ON
                sps.studentId = s.id
            JOIN project_master p ON
                p.psId = ps.id
            JOIN group_master g ON
                g.projectId = p.id
            SET
                a.status = '${SType.INACTIVE}',
                c.status = '${SType.INACTIVE}',
                m.status = '${SType.INACTIVE}',
                s.status = '${SType.INACTIVE}',
                ps.status = '${PSSType.COMPLETED}',
                sps.status = '${SType.INACTIVE}',
                p.status = '${SType.INACTIVE}',
                g.status = '${SType.INACTIVE}'
            WHERE
                clg.id = ${collegeId};
        `);
            logger.debug(`reqUser: ${reqUsername} college inActiveAllRelations service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in college inActiveAllRelations service`);
            return { Error: true, message: err_message };
        }
    }
}
