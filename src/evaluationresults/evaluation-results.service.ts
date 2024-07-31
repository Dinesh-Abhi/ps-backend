import { Injectable } from '@nestjs/common';
import { CreateEvaluationResultDto, CreateGroupResultDto, UpdateResultCommentDto } from './dto/evaluator-results.dto';
import logger from 'src/loggerfile/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluationResult } from './evaluation-results.entity';
import { Repository } from 'typeorm';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { EvaluationType } from 'src/enums';

@Injectable()
export class EvaluationResultsService {
    constructor(
        @InjectRepository(EvaluationResult)
        private readonly evaluationResultRepository: Repository<EvaluationResult>,
        @InjectRepository(EvaluatorStudent)
        private readonly evaluatorStudentRepository: Repository<EvaluatorStudent>,
    ) { }

    async create(reqUsername: string, createEvaluationResultDto: CreateEvaluationResultDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluationResults create service started`);
            const evaluationResult = new EvaluationResult();
            evaluationResult.answer1 = createEvaluationResultDto.answer1;
            evaluationResult.answer2 = createEvaluationResultDto.answer2;
            evaluationResult.answer3 = createEvaluationResultDto.answer3;
            evaluationResult.answer4 = createEvaluationResultDto.answer4;
            evaluationResult.answer5 = createEvaluationResultDto.answer5;
            evaluationResult.answer6 = createEvaluationResultDto.answer6;
            evaluationResult.answer7 = createEvaluationResultDto.answer7;
            evaluationResult.answer8 = createEvaluationResultDto.answer8;
            evaluationResult.answer9 = createEvaluationResultDto.answer9;
            evaluationResult.answer10 = createEvaluationResultDto.answer10;
            evaluationResult.grade = createEvaluationResultDto.grade;
            evaluationResult.evaluatorstudent = { id: createEvaluationResultDto.estudentId } as EvaluatorStudent;
            evaluationResult.comments = createEvaluationResultDto.comments;
            evaluationResult.updatedby = reqUsername;
            await this.evaluationResultRepository.save(evaluationResult);
            logger.debug(`reqUser: ${reqUsername} EvaluationResults create service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.SUBMIT };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in EvaluationResults create service`);
            return { Error: true, message: err_message };
        }
    }

    async createIndividual(reqUsername: string, createIndividualEvaluationResultDto: CreateEvaluationResultDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluationResults createIndividual service started`);
            const estudent = await this.evaluatorStudentRepository.findOne({ where: { id: createIndividualEvaluationResultDto.estudentId }, relations: { evaluationschedule: true } });
            if (estudent != null) {
                const start_time = new Date(estudent?.evaluationschedule.start);
                start_time.setUTCHours(0, 0, 0, 0);
                const end_time = new Date(estudent?.evaluationschedule.end);
                start_time.setUTCHours(0, 0, 0, 0);
                const today_time = new Date();
                today_time.setUTCHours(0, 0, 0, 0);
                if (start_time.getTime() <= today_time.getTime()) {
                    if (today_time.getTime() <= end_time.getTime()) {
                        await this.create(reqUsername, createIndividualEvaluationResultDto);
                    } else {
                        throw ERROR_MESSAGES.EVALUATION_UPLOAD_END
                    }
                } else {
                    throw ERROR_MESSAGES.EVALUATION_UPLOAD_NOT_START
                }
            }
            logger.debug(`reqUser: ${reqUsername} EvaluationResults createIndividual service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.SUBMIT };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in EvaluationResults createIndividual service`);
            return { Error: true, message: err_message };
        }
    }

    async createGroup(reqUsername: string, createGroupResultDto: CreateGroupResultDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluationResults createGroup service started`);
            const dublicate: any[] = [];
            const evaluatorstudents = await this.evaluatorStudentRepository.find({
                where: {
                    group: { id: createGroupResultDto.groupId },
                    evaluationschedule: { id: createGroupResultDto.escheduleId }, type: EvaluationType.GROUPEVALUATION
                },
                relations: { evaluationschedule: true }
            })
            if (evaluatorstudents != null && evaluatorstudents.length != 0) {
                const start_time = new Date(evaluatorstudents[0]?.evaluationschedule.start);
                start_time.setUTCHours(0, 0, 0, 0);
                const end_time = new Date(evaluatorstudents[0]?.evaluationschedule.end);
                start_time.setUTCHours(0, 0, 0, 0);
                const today_time = new Date();
                today_time.setUTCHours(0, 0, 0, 0);
                if (start_time.getTime() <= today_time.getTime()) {
                    if (today_time.getTime() <= end_time.getTime()) {
                        for (let i = 0; i < evaluatorstudents.length; i++) {
                            const createEvaluationResultDto = new CreateEvaluationResultDto();
                            createEvaluationResultDto.answer1 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer2 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer3 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer4 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer5 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer6 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer7 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer8 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer9 = createGroupResultDto.answer1;
                            createEvaluationResultDto.answer10 = createGroupResultDto.answer1;
                            createEvaluationResultDto.estudentId = evaluatorstudents[i].id;
                            createEvaluationResultDto.grade = createGroupResultDto.grade;
                            createEvaluationResultDto.comments = createGroupResultDto.comments;
                            await this.create(reqUsername, createEvaluationResultDto);
                        }
                    } else {
                        throw ERROR_MESSAGES.EVALUATION_UPLOAD_END
                    }
                } else {
                    throw ERROR_MESSAGES.EVALUATION_UPLOAD_NOT_START
                }
            }

            logger.debug(`reqUser: ${reqUsername} EvaluationResults createGroup service returned with dublicate: [${dublicate}]`);
            return { Error: false, message: RESPONSE_MESSAGE.SUBMIT };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in EvaluationResults createGroup service`);
            return { Error: true, message: err_message };
        }
    }

    async updateResultComment(reqUsername: string, updateResultCommentDto: UpdateResultCommentDto) {
        try {
            logger.debug(`reqUser: ${reqUsername} EvaluationResults updateResultComment service started`);
            await this.evaluationResultRepository.update({id:updateResultCommentDto.id},{
                comments:updateResultCommentDto.comments,
                updatedby:reqUsername,
            })
            logger.debug(`reqUser: ${reqUsername} EvaluatorResults updateResultComment service returned`);
            return { Error: false, message: RESPONSE_MESSAGE.UPDATED };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in EvaluationResults updateResultComment service`);
            return { Error: true, message: err_message };
        }
    }
}
