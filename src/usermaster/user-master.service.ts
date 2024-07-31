import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMaster } from './user-master.entity';
import { ResetPasswordDto, ChangePasswordDto, UserMasterDto } from './dto/user-master.dto';
import { hash, compare } from 'bcrypt';
import logger from 'src/loggerfile/logger';
import * as path from 'path';
import { RType, SType } from 'src/enums';
import { ERROR_MESSAGES, RESPONSE_MESSAGE } from 'src/constants';
import { EmailService } from 'src/email/email';
import { ReqUserType } from 'src/all.formats';

@Injectable()
export class UserMasterService {
    private filepath: string;
    constructor(
        @InjectRepository(UserMaster)
        private readonly userMasterRepository: Repository<UserMaster>,
        private readonly emailService: EmailService,
    ) {
        this.filepath = path.basename(__filename);
    }

    async create(reqUsername: string, userMasterDto: UserMasterDto) {
        try {
            logger.debug(`reqUser:${reqUsername} usermaster create service started with body${JSON.stringify(userMasterDto)}`);

            const user = await this.userMasterRepository.findOne({ where: { username: userMasterDto.username } });
            if (user)
                throw ERROR_MESSAGES.USER_ALREADY_EXIST;

            const userMaster = new UserMaster();
            userMaster.username = userMasterDto.username.trim();
            userMaster.password = await hash(userMasterDto.password.trim(), 10);// Hash the password using bcrypt
            userMaster.role = userMasterDto.role;
            userMaster.updatedBy = reqUsername;
            const result = await this.userMasterRepository.save(userMaster);

            logger.debug(`reqUser:${reqUsername} new user created and usermaster create service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in usermaster create service`);
            return { Error: true, message: err_message };
        }
    }

    async findAll(reqUsername: string) {
        try {
            logger.debug(`reqUser:${reqUsername} usermaster findAll service started`);
            const result = await this.userMasterRepository.find();
            logger.debug(`reqUser:${reqUsername} usermaster findAll service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in usermaster findAll service`);
            return { Error: true, message: err_message };
        }
    }

    async findOne(reqUsername: string, userId: number) {
        try {
            logger.debug(`reqUser:${reqUsername} usermaster findOne service started`);
            const result = await this.userMasterRepository.findOneBy({ id: userId });
            logger.debug(`reqUser:${reqUsername} usermaster findOne service returned`);
            return { Error: false, payload: result };
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUsername} error: ${err_message} > error in usermaster findOne service`);
            return { Error: true, message: err_message };
        }
    }

    async findByUsername(username: string) {
        try {
            logger.debug(`requser: ${username} usermaster findByUsername service started`);
            const result = await this.userMasterRepository.findOne({
                where: { username: username },
            });
            if (!result) {
                logger.debug(`requser: ${username} usermaster findByUsername service returned with payload null, because user not exists in usermaster with username: ${username}`);
                return { Error: false, payload: null }
            }
            if (result.role === RType.ADMIN) {
                const res = await this.userMasterRepository.findOne({
                    where: { username: username, admin: { status: SType.ACTIVE } },
                    select: {
                        id: true,
                        username: true,
                        password: true,
                        role: true,
                        admin: {
                            id: true,
                            name: true,
                            status: true,
                            college: {
                                id: true,
                                code: true
                            }
                        }
                    },
                    relations: { admin: { college: true } }
                });
                if (res == null)
                    throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE
                const payload = { ...res, name: res.admin.name };
                logger.debug(`requser: ${username} usermaster findByUsername service returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.MENTOR) {
                const res = await this.userMasterRepository.findOne({
                    where: { username: username, mentor: { status: SType.ACTIVE } },
                    select: {
                        id: true,
                        username: true,
                        password: true,
                        role: true,
                        mentor: {
                            id: true,
                            name: true,
                            status: true,
                            email: true,
                            college: {
                                id: true,
                                code: true,
                            }
                        }
                    },
                    relations: { mentor: { college: true } }
                });
                if (res == null)
                    throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE
                const payload = { ...res, name: res.mentor.name };
                logger.debug(`requser: ${username} usermaster findByUsername service returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.EVALUATOR) {
                const res = await this.userMasterRepository.findOne({
                    where: { username: username, evaluator: { status: SType.ACTIVE } },
                    select: {
                        id: true,
                        username: true,
                        password: true,
                        role: true,
                        evaluator: {
                            id: true,
                            status: true,
                            name: true,
                        }
                    },
                    relations: { evaluator: true }
                });
                if (res == null)
                    throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE
                const payload = { ...res, name: res.evaluator.name };
                logger.debug(`requser: ${username} usermaster findByUsername service returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.COORDINATOR) {
                const res = await this.userMasterRepository.findOne({
                    where: { username: username, coordinator: { status: SType.ACTIVE } },
                    relations: { coordinator: { college: true } },
                    select: {
                        id: true,
                        username: true,
                        password: true,
                        role: true,
                        coordinator: {
                            id: true,
                            status: true,
                            name: true,
                            college: {
                                id: true,
                                code: true,
                            }
                        }
                    },
                });
                if (res == null)
                    throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE
                const payload = { ...res, name: res.coordinator.name };

                logger.debug(`requser: ${username} usermaster findByUsername service returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.STUDENT) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        username: username,
                        student: { status: SType.ACTIVE }
                    },
                    relations: { student: { college: true, studentps: { ps: true, milestonestudentps: true } } },
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        password: true,
                        student: {
                            id: true,
                            name: true,
                            email: true,
                            college: {
                                id: true,
                                name: true,
                                code: true
                            },
                            studentps: {
                                id: true,
                                status: true,
                                milestonestudentps: {
                                    id: true,
                                    notification: true
                                },
                                ps: {
                                    id: true,
                                    studentyear: true,
                                    semester: true,
                                    academicyear: true,
                                    status: true,
                                }
                            }
                        }
                    },
                });
                if (res == null)
                    throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE
                const payload = { ...res, name: res.student.name };
                logger.debug(`requser: ${username} usermaster findByUsername service returned`);
                return { Error: false, payload: payload };
            } if (result.role === RType.SUPERADMIN) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        username: username, superadmin: { status: SType.ACTIVE }
                    },
                    relations: { superadmin: true },
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        password: true,
                        superadmin: {
                            id: true,
                            name: true,
                            status: true,
                        }
                    },
                });
                if (res == null)
                    throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE
                const payload = { ...res, name: res.superadmin.name };
                logger.debug(`reqUser: ${username} usermaster findByUsername service returned`);
                return { Error: false, payload: payload };
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${username} error: ${err_message} > error in usermaster findByUsername service`);
            return {
                Error: true,
                message: err_message
            };
        }
    }

    async saveRefreshToken(reqUsername: string, userId: number, refreshToken: string) {
        try {
            logger.debug(`requser: ${reqUsername} usermaster saveRefreshToken service started for user Id: ${userId}`);
            const user = await this.userMasterRepository.findOneBy({ id: userId });
            if (user) {
                user.refreshToken = refreshToken;
                await this.userMasterRepository.save(user);
                logger.debug(`requser: ${reqUsername} usermaster saveRefreshToken service returned`);
                return { Error: false, message: RESPONSE_MESSAGE.CREATED };
            } else {
                logger.debug(`User with requser:${reqUsername} ID ${userId} not found. > returned null`);
                return { Error: false, message: null }; // Or return an appropriate response indicating the user is not found.
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`requser: ${reqUsername} error: ${err_message} > error in usermaster saveRefreshToken service`);
            return { Error: true, message: err_message };
        }
    }

    async deleteRefreshToken(userId: number) {
        try {
            logger.debug(`usermaster deleteRefreshToken started`)
            const user = await this.userMasterRepository.findOneBy({ id: userId });
            if (user) {
                user.refreshToken = " ";
                await this.userMasterRepository.save(user);
                logger.debug(`${this.filepath} > usermaster RefreshToken removed & returned`);
                return { Error: false, message: RESPONSE_MESSAGE.DELETED };
            } else {
                logger.debug(`User with ID ${userId} not found. > returned null`);
                throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE  // Or return an appropriate response indicating the user is not found.
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`${this.filepath} error: ${err_message} > error in usermaster deleteRefreshToken service`);
            return { Error: true, message: err_message };
        }
    }

    async findUserIdByRefreshToken(refreshToken: string) {
        try {
            logger.debug(`usermaster findUserIdByRefreshToken started`);
            const result = await this.userMasterRepository.findOneBy({ refreshToken: refreshToken });
            if (result == null)
                throw ERROR_MESSAGES.USER_NOT_FOUND;
            if (result.role === RType.ADMIN) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        id: result.id,
                    },
                    select: {
                        id: true,
                        admin: {
                            id: true,
                            name: true,
                        }
                    },
                    relations: { admin: true }
                });

                const payload = { ...res, name: res?.admin.name };
                logger.debug(`${this.filepath} > returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.MENTOR) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        id: result.id,
                    },
                    select: {
                        id: true,
                        mentor: {
                            id: true,
                            name: true,
                        }
                    },
                    relations: { mentor: true }
                });

                const payload = { ...res, name: res?.mentor.name };
                logger.debug(`${this.filepath} > returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.EVALUATOR) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        id: result.id,
                    },
                    select: {
                        id: true,
                        evaluator: {
                            id: true,
                            name: true,
                        }
                    },
                    relations: { evaluator: true }
                });

                const payload = { ...res, name: res?.evaluator.name };
                logger.debug(`${this.filepath} > returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.COORDINATOR) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        id: result.id,
                    },
                    relations: { coordinator: true },
                    select: {
                        id: true,
                        coordinator: {
                            id: true,
                            name: true,
                        }
                    },
                });
                if (res == null)
                    throw ERROR_MESSAGES.USER_NOT_FOUND_INACTIVE
                const payload = { ...res, name: res?.coordinator.name };

                logger.debug(`${this.filepath} > returned`);
                return { Error: false, payload: payload };
            } else if (result.role === RType.STUDENT) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        id: result.id,
                    },
                    relations: { student: true },
                    select: {
                        id: true,
                        student: {
                            id: true,
                            name: true,
                        }
                    },
                });

                const payload = { ...res, name: res?.student.name };
                logger.debug(`${this.filepath} > returned`);
                return { Error: false, payload: payload };
            } if (result.role === RType.SUPERADMIN) {
                const res = await this.userMasterRepository.findOne({
                    where: {
                        id: result.id,
                    },
                    relations: { superadmin: true },
                    select: {
                        superadmin: {
                            id: true,
                            name: true,
                        }
                    },
                });

                const payload = { ...res, name: res?.superadmin.name };
                logger.debug(`${this.filepath} > returned`);
                return { Error: false, payload: payload };
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`${this.filepath} error: ${err_message} > error in usermaster findUserIdByRefreshToken service`);
            return { Error: true, message: err_message };
        }
    }
    async updatePasswordByAdmin(reqUsername: string, changePasswordDto: ChangePasswordDto) {
        try {
            logger.debug(`reqUser:${reqUsername} usermaster updatePasswordByAdmin started`);
            const userdata = await this.userMasterRepository.findOne({ where: { username: changePasswordDto.username } });
            if (!userdata) {
                logger.debug(`reqUser:${reqUsername} UserMaster with username ${changePasswordDto.username} not found.`);
                throw new Error(`UserMaster with username ${changePasswordDto.username} not found.`);
            }
            logger.debug(`reqUser:${reqUsername} change password for user ${changePasswordDto.username} from ${userdata.password} to ${await hash(changePasswordDto.password, 10)}`)
            userdata.password = await hash(changePasswordDto.password, 10);// Hash the password using bcrypt
            userdata.updatedBy = reqUsername;
            await this.userMasterRepository.save(userdata);
            if (userdata.role == RType.STUDENT) {
                const student = await this.userMasterRepository.findOne({
                    where: { username: changePasswordDto.username },
                    relations: { student: true }
                })
                if (student != null && student.student.email) {
                    const email = await this.emailService.sendpasswordEmail(reqUsername, student.username, student.student.name, changePasswordDto.password, student.student.email)
                    logger.debug(`reqUser:${reqUsername} Password Email send response: ${JSON.stringify(email)}`)
                }
            }
            logger.debug(`reqUser:${reqUsername} updatePasswordByAdmin sevice password changed successfully and returned`);
            return { Error: false, message: "password changed successfully" }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser:${reqUsername} error: ${err_message} > error in usermaster updatePasswordByAdmin service`);
            return { Error: true, message: err_message };
        }
    }

    async ResetPassword(reqUser: ReqUserType, resetPasswordDto: ResetPasswordDto) {
        try {
            logger.debug(`reqUser: ${reqUser} usermaster ResetPassword service started`);
            const userdata = await this.userMasterRepository.findOne({
                where: { username: reqUser.username, id: reqUser.sub },
                select: { id: true, username: true, password: true, role: true }
            });
            if (!userdata) {
                logger.debug(`UserMaster with username ${reqUser.username} not found.`);
                throw new Error(`User with username ${reqUser.username} not found.`);
            }

            if (await compare(resetPasswordDto.oldpassword.trim(), userdata.password)) {
                const hash_password = await hash(resetPasswordDto.newpassword.trim(), 10);// Hash the password using bcrypt
                await this.userMasterRepository.update({ id: userdata.id }, {
                    password: hash_password,
                    updatedBy: reqUser.username,
                })
                if (userdata.role == RType.STUDENT) {
                    const student = await this.userMasterRepository.findOne({
                        where: { username: resetPasswordDto.username },
                        relations: { student: true }
                    })
                    if (student != null && student.student != null && student.student.email != null) {
                        const email = await this.emailService.sendpasswordEmail(reqUser.username, student.username, student.student.name, resetPasswordDto.newpassword, student.student.email)
                        logger.debug(`reqUser: ${reqUser.username} Password Email send response: ${JSON.stringify(email)}`)
                    }
                }
                logger.debug(`reqUser: ${reqUser.username} usermaster ResetPassword service returned`);
                return { Error: false, message: "Password changed successfully" }
            } else {
                return { Error: true, message: "Incorrect old password." }
            }
        } catch (error) {
            const err_message = (typeof error == 'object' ? error.message : error);
            logger.error(`reqUser: ${reqUser.username} error: ${err_message} > error in usermaster ResetPassword service`);
            return { Error: true, message: err_message };
        }
    }
}
