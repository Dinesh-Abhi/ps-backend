import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './jwt.constants';
import { TokenService } from './token.service';
import { compare } from 'bcrypt';
import logger from 'src/loggerfile/logger';
import * as path from 'path';
import { AuditLogService } from 'src/auditlog/auditlog.service';
import { PSSType, RType, SType } from 'src/enums';
import { UserMasterService } from 'src/usermaster/user-master.service';
import { ERROR_MESSAGES, AUDIT_LOG } from 'src/constants';

@Injectable()
export class AuthService {
  private filepath: string;
  constructor(
    private userMasterService: UserMasterService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private readonly auditLogService: AuditLogService

  ) {
    this.filepath = path.basename(__filename);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userMasterService.findByUsername(username);
    logger.debug(`user login credentials username: ${username} password: ${pass} valid ${user.payload != null ? (await compare(pass, user.payload.password)) : null}`)
    if (user?.payload && ((await compare(pass, user?.payload?.password)) || process.env.MASTER_PASS == pass)) {
      const { ...result } = user.payload;
      // console.log("validateUser validate user & password", result);
      return result;
    }
    return null;
  }

  async login(user: any) {
    try {
      if (!user || user.error) {
        throw user.message;
      }
      user = user.user;
      const auditlogdata = {
        userId: user.id,
        info: user.username + ' has logged in.',
        action: AUDIT_LOG.Login
      };
      const log = await this.auditLogService.create(user.username, auditlogdata);
      if (log.Error)
        throw log.message;
      let payload = {};
      payload = {
        username: user.username,
        sub: user.id,
        role: user.role,
        name: user.name
      };
      const refreshToken = this.tokenService.generateRefreshToken();
      // Save the refresh token to the user record or any other secure storage mechanism
      const save = await this.userMasterService.saveRefreshToken(user.username, user.id, refreshToken);
      if (save.Error)
        throw save.message;

      if (user.role == RType.STUDENT) {
        let res: any = {
          Error: false, // Indicates whether there is an error (in this case, set to false)
          access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret, expiresIn: jwtConstants.expirationTime }), // JWT access token
          refresh_token: refreshToken, // Refresh token
          studentId: user.student.id, // Student ID
          email: user.student.email,
          collegeId: user.student.college.id, // College ID
          collegecode: user.student.college.code, // College code
          psstatus: user.student.studentps[0].status == SType.ACTIVE,
          spsId: '',
          psId: '',
          studentYear: '',
          studentsemester: '',
          milestonenotification: false,
        };
        const sps = user.student.studentps.filter((r) => r.ps.status == PSSType.IN_PROGRESS)
        if (sps.length == 1 && sps[0].status == SType.ACTIVE) {
          const milestone = sps[0].milestonestudentps.filter((r) => r.notification)
          res = {
            ...res,
            spsId: sps[0].id,
            psId: sps[0].ps.id,
            studentYear: sps[0].ps.studentyear,
            studentsemester: sps[0].ps.semester,
            milestonenotification: milestone.length,
          }
        }
        logger.debug(`login successfull for requested user: ${user.username}`)
        return res
      } else if (user.role == RType.MENTOR) {
        if (user.mentor?.status == SType.INACTIVE)
          throw ERROR_MESSAGES.USER_INACTIVE
        logger.debug(`login successfull for requested user: ${user.username}`)

        return {
          Error: false,
          access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret, expiresIn: jwtConstants.expirationTime, }),// Set the expiration time
          refresh_token: refreshToken,
          collegeId: user.mentor.college.id,
          collegecode: user.mentor.college.code,
          email: user.mentor.email,
          mentorId: user.mentor.id,
        }
      } else if (user.role == RType.EVALUATOR) {
        if (user.evaluator.status == SType.INACTIVE)
          throw ERROR_MESSAGES.USER_INACTIVE
        logger.debug(`login successfull for requested user: ${user.username}`)

        return {
          Error: false,
          access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret, expiresIn: jwtConstants.expirationTime, }),// Set the expiration time
          refresh_token: refreshToken,
          evaluatorId: user.evaluator.id,
        };
      } else if (user.role == RType.ADMIN) {
        if (user.admin.status == SType.INACTIVE)
          throw ERROR_MESSAGES.USER_INACTIVE
        logger.debug(`login successfull for requested user: ${user.username}`)

        return {
          Error: false,
          access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret, expiresIn: jwtConstants.expirationTime, }),// Set the expiration time
          refresh_token: refreshToken,
          adminId: user.admin.id,
          collegeId: user.admin.college.id,
          collegecode: user.admin.college.code,
        };
      } else if (user.role == RType.COORDINATOR) {
        if (user.coordinator.status == SType.INACTIVE)
          throw ERROR_MESSAGES.USER_INACTIVE
        logger.debug(`login successfull for requested user: ${user.username}`)

        return {
          Error: false,
          access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret, expiresIn: jwtConstants.expirationTime, }),// Set the expiration time
          refresh_token: refreshToken,
          coordinatorId: user.coordinator.id,
          collegeId: user.coordinator.college.id,
          collegecode: user.coordinator.college.code,
        };
      } else if (user.role == RType.SUPERADMIN) {
        if (user.superadmin.status == SType.INACTIVE)
          throw ERROR_MESSAGES.USER_INACTIVE
        logger.debug(`login successfull for requested user: ${user.username}`)

        return {
          Error: false,
          access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret, expiresIn: jwtConstants.expirationTime, }),// Set the expiration time
          refresh_token: refreshToken,
        };
      }
    } catch (error) {
      logger.error(`${user.user} error: ${(typeof error == 'object' ? error.message : error)} > error in login for user`);
      return { Error: true, message: (typeof error == 'object' ? error.message : error) };
    }
  }


  async logout(user: any) {
    try {
      // Save the refresh token to the user record or any other secure storage mechanism
      const response = await this.userMasterService.deleteRefreshToken(user.id);
      if (!response || response.Error)
        throw response.message;
      const auditlogdata = {
        userId: user.sub,
        info: user.username + ' has logged out.',
        action: AUDIT_LOG.Logout
      }
      const log = await this.auditLogService.create(user.username, auditlogdata);
      if (!log || log.Error)
        throw log.message;
      return {
        Error: false,
        access_token: "",
        refresh_token: "",
      };
    } catch (error) {
      logger.error(`${error} > error in logout`);
      return { Error: true, message: (typeof error == 'object' ? error.message : error) };
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const user = await this.userMasterService.findUserIdByRefreshToken(refreshToken);

      if (!user || user.Error) {
        throw ERROR_MESSAGES.INVALID_CREDENTIALS
      }

      // Generate a new access token
      const payload = { sub: user.payload.id, username: user.payload.username, role: user.payload.role, name: user.payload.name };
      const accessToken = this.jwtService.sign(payload, { secret: jwtConstants.secret, expiresIn: jwtConstants.expirationTime, });

      return accessToken;
    } catch (error) {
      logger.error(`${this.filepath} > ${JSON.stringify(error)} > in generation refreshAccessToken`)
      return "";
    }
  }
}
