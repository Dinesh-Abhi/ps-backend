import { Controller, Get, Body, Param, ParseIntPipe, UseGuards, Put, Request, UsePipes, ValidationPipe, Post } from '@nestjs/common';
import { StudentPsService } from './studentps.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import logger from 'src/loggerfile/logger';
import { GroupEnrollDto, AddNewStudentToGroupDto, ReplaceStudentInGroupDto, MentorStudentdayReportDto, AddOrUpdateGithubLinkDto, SyncPastDateAttendanceDto, SyncPastDateAttendanceBetweenDatesDto, AddReviewCommentDto, AddMentorReviewCommentDto } from './dto/student-ps.dto';
import { Cron } from '@nestjs/schedule';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('StudentPs')
@ApiSecurity("JWT-auth")
@Controller('studentps')
export class StudentPsController {
  constructor(private readonly studentPsService: StudentPsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @SkipThrottle(true)
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('enrollgroup')
  @UsePipes(new ValidationPipe())
  async groupEnroll(@Request() req, @Body() groupEnrollDto: GroupEnrollDto) {
    logger.debug(`reqUser: ${req.user.username} studentps groupEnroll is calling with body ${JSON.stringify(groupEnrollDto)}`);
    const result = await this.studentPsService.groupEnroll(req.user, groupEnrollDto);
    logger.debug(`reqUser: ${req.user.username} return in studentps groupEnroll controller > service response: ${(result.Error ? `error: ${result.message}` : result.message)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT', 'ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('students/:psId')
  async findStudents(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
    //this is user to find student is already enrolled in group or not in that ps
    logger.debug(`reqUser: ${req.user.username} studentps findStudents is calling with param psId: ${psId} `);
    const result = await this.studentPsService.findStudents(req.user.username, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps findStudents controller > service response: ${(result.Error ? `error: ${result.message}` : `students_count :${result.payload.length}`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('find/:studentId/:psId')
  async getStudentDetails(@Request() req, @Param('studentId', ParseIntPipe) studentId: number, @Param('psId', ParseIntPipe) psId: number) {
    // this service is used to find the details of student in that ps like dashboard details
    logger.debug(`reqUser: ${req.user.username} studentps getStudentDetails is calling with params studentId:${studentId} psId:${psId} `);
    const result = await this.studentPsService.getStudentDetails(req.user, studentId, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps getStudentDetails controller > service response: ${(result.Error ? `error: ${result.message}` : `Student data sent successfully`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('findpps/:studentId/:psId')
  async getPPsByStudent(@Request() req, @Param('studentId', ParseIntPipe) studentId: number, @Param('psId', ParseIntPipe) psId: number) {
    // this service is used to find the details of student pp in that ps
    logger.debug(`reqUser: ${req.user.username} studentps getPPsByStudent is calling with params studentId:${studentId} psId:${psId} `);
    const result = await this.studentPsService.getPPsByStudent(req.user, studentId, psId);
    logger.error(`reqUser: ${req.user.username} return in studentps getPPsByStudent controller > service response: ${(result.Error ? `error: ${result.message}` : `Task data sent successfully`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MENTOR', 'EVALUATOR', 'STUDENT')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('pasthistory/:studentId/:psId')
  async getPastHistory(@Request() req, @Param('studentId', ParseIntPipe) studentId: number, @Param('psId', ParseIntPipe) psId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps getPastHistory is calling with params studentId:${studentId} psId:${psId} `);
    const result = await this.studentPsService.getPastHistory(req.user, studentId, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps getPastHistory controller > service response: ${(result.Error ? `error: ${result.message}` : `Student history sent successfully`)}  `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EVALUATOR')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('findstudents/:psId')
  async findAllStudentForEvaluator(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
    //finding students of active ps to review the pp of students
    logger.debug(`reqUser: ${req.user.username} studentps findAllStudentForEvaluator is calling with params psId:${psId} `);
    const result = await this.studentPsService.findAllStudentForEvaluator(req.user.username, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps findAllStudentForEvaluator controller > service response: ${(result.Error ? `error: ${result.message}` : `student_count: ${result.payload.length}`)}  `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MENTOR')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('mentor/:mentorId/:psId/:projectId')
  async getMentorStudents(@Request() req, @Param('mentorId', ParseIntPipe) mentorId: number, @Param('psId', ParseIntPipe) psId: number, @Param('projectId', ParseIntPipe) projectId: number) {
    //finding students for mentor
    logger.debug(`reqUser: ${req.user.username} studentps getMentorStudents is calling with params mentorId:${mentorId} psId:${psId} `);
    const result = await this.studentPsService.getMentorStudents(req.user, mentorId, psId, projectId);
    logger.debug(`reqUser: ${req.user.username} return in studentps getMentorStudents controller > service response: ${(result.Error ? `error: ${result.message}` : `Students_count: ${result.payload.length}`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('groupstudent/:psId')
  async getStudentAndGroup(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps getStudentAndGroup is calling with params psId:${psId} `);
    const result = await this.studentPsService.getStudentAndGroup(req.user, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps getStudentAndGroup controller > service response: ${(result.Error ? `error:${result.message}` : `Students_count who are in group:${result.payload.length}`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('group/:clgId')
  async getGroup(@Request() req, @Param('clgId', ParseIntPipe) clgId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps getGroup is calling with params clgId:${clgId} `);
    const result = await this.studentPsService.getGroup(req.user.username, clgId);
    logger.debug(`reqUser: ${req.user.username} return in studentps getGroup controller > service response: ${(result.Error ? `error:${result.message}` : `Groups_count:${result.payload.length}`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('changegroup/:spsId/:gId')
  async studentChangeGroup(@Request() req, @Param('spsId', ParseIntPipe) spsId: number, @Param('gId', ParseIntPipe) gId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps studentChangeGroup is calling with params spsId:${spsId} groupId:${gId} `);
    const result = await this.studentPsService.studentChangeGroup(req.user, spsId, gId);
    logger.debug(`reqUser: ${req.user.username} return in studentps studentChangeGroup controller > service response: ${result.message} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('removestudentfromgroup/:spsId')
  async removeStudentFromGroup(@Request() req, @Param('spsId', ParseIntPipe) spsId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps removeStudentFromGroup is calling with params spsId:${spsId} `);
    const result = await this.studentPsService.removeStudentFromGroup(req.user.username, spsId);
    logger.debug(`reqUser: ${req.user.username} return in studentps removeStudentFromGroup controller > service response: ${result.message} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('replacestudentingroup')
  @UsePipes(new ValidationPipe())
  async replaceStudentInGroup(@Request() req, @Body() replaceStudentInGroupDto: ReplaceStudentInGroupDto) {
    logger.debug(`reqUser: ${req.user.username} studentps replaceStudentInGroup is callingwith body ${JSON.stringify(replaceStudentInGroupDto)} `);
    const result = await this.studentPsService.replaceStudentInGroup(req.user, replaceStudentInGroupDto);
    logger.debug(`reqUser: ${req.user.username} return in studentps replaceStudentInGroup controller > service response: ${result.message} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('addnewstudenttogroup')
  @UsePipes(new ValidationPipe())
  async addNewStudentToGroup(@Request() req, @Body() addNewStudentToGroupDto: AddNewStudentToGroupDto) {
    logger.debug(`reqUser: ${req.user.username} studentps addNewStudentToGroup is calling with body ${JSON.stringify(addNewStudentToGroupDto)} `);
    const result = await this.studentPsService.addNewStudentToGroup(req.user, addNewStudentToGroupDto);
    logger.debug(`reqUser: ${req.user.username} return in studentps addNewStudentToGroup controller > service response: ${result.message} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('findall/:studentId')
  async findAllPsByStudent(@Request() req, @Param('studentId', ParseIntPipe) studentId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps findAllPsByStudent is calling with params studentId:${studentId} `);
    const result = await this.studentPsService.findAllPsByStudent(req.user, studentId);
    logger.debug(`reqUser: ${req.user.username} return in studentps findAllPsByStudent controller > service response: ${(result.Error ? `error: ${result.message}` : `ps_count:${result.payload.length}`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MENTOR')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('mentorstudentsattendancebydate/:psId/:mentorId/:date')  //date format YYYY-MM-DD
  async getMentorStudentsAtendanceAtGivenDate(@Request() req, @Param('psId', ParseIntPipe) psId: number, @Param('mentorId', ParseIntPipe) mentorId: number, @Param('date') date: string) {
    const mentorStudentdayReportDto = new MentorStudentdayReportDto();
    mentorStudentdayReportDto.psId = psId;
    mentorStudentdayReportDto.mentorId = mentorId;
    mentorStudentdayReportDto.date = date;
    logger.debug(`reqUser: ${req.user.username} studentps getMentorStudentsAtendanceAtGivenDate is calling with body ${JSON.stringify(mentorStudentdayReportDto)} `);
    const result = await this.studentPsService.getMentorStudentsAtendanceAtGivenDate(req.user, mentorStudentdayReportDto);
    logger.debug(`reqUser: ${req.user.username} return in studentps getMentorStudentsAtendanceAtGivenDate controller > service response: ${(result.Error ? `error: ${result.message}` : "No.of records: " + result.payload.length)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MENTOR')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('mentordashboardreport/:mentorId/:psId')
  async mentorDashboardReport(@Request() req, @Param('mentorId', ParseIntPipe) mentorId: number, @Param('psId', ParseIntPipe) psId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps mentorDashboardReport is calling with params psId:${psId} mentorId:${mentorId} `);
    const result = await this.studentPsService.mentorDashboardReport(req.user, mentorId, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps mentorDashboardReport controller > service response: ${(result.Error ? `error: ${result.message}` : "requested data sent")} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('uploadgithub')
  @UsePipes(new ValidationPipe())
  async addOrUpdateGitHubLink(@Request() req, @Body() addOrUpdateGithubLinkdto: AddOrUpdateGithubLinkDto) {
    logger.debug(`reqUser: ${req.user.username} studentps addOrUpdateGitHubLink is calling with body addOrUpdateGithubLinkdto: ${JSON.stringify(addOrUpdateGithubLinkdto)}`);
    const result = await this.studentPsService.addOrUpdateGitHubLink(req.user, addOrUpdateGithubLinkdto);
    logger.debug(`reqUser: ${req.user.username} return in studentps addOrUpdateGitHubLink controller > service response: ${(result.Error ? `error: ${result.message}` : `response ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EVALUATOR')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('addreviewcomment')
  @UsePipes(new ValidationPipe())
  async addReviewComment(@Request() req, @Body() addReviewCommentDto: AddReviewCommentDto) {
    logger.debug(`reqUser: ${req.user.username} studentps addReviewComment is calling with body addReviewCommentDto: ${JSON.stringify(addReviewCommentDto)}`);
    const result = await this.studentPsService.addReviewComment(req.user.username, addReviewCommentDto);
    logger.debug(`reqUser: ${req.user.username} return in studentps addReviewComment controller > service response: ${(result.Error ? `error: ${result.message}` : `response ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MENTOR')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Put('addmentorreviewcomment')
  @UsePipes(new ValidationPipe())
  async addMentorReviewComments(@Request() req, @Body() addMentorReviewCommentDto: AddMentorReviewCommentDto) {
    logger.debug(`reqUser: ${req.user.username} studentps addReviewComment is calling with body addMentorReviewComments: ${JSON.stringify(addMentorReviewCommentDto)}`);
    const result = await this.studentPsService.addMentorReviewComments(req.user, addMentorReviewCommentDto);
    logger.debug(`reqUser: ${req.user.username} return in studentps addMentorReviewComments controller > service response: ${(result.Error ? `error: ${result.message}` : `response ${result.message}`)}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Put('offreviewnotification/:spsId')
  @ApiResponse({ status: 201, description: 'The record updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async offReviewNotification(@Request() req, @Param('spsId', ParseIntPipe) spsId: number) {
    logger.debug(`requser: ${req.user.username} studentps offReviewNotification is calling with param spsId:${spsId}`);
    const result = await this.studentPsService.offReviewNotification(req.user, spsId);
    logger.debug(`requser: ${req.user.username} return in studentps offReviewNotification controller > service response: ${result.Error ? `error:${result.message}` : `notification ${result.message}`}`);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('admindailyreport/:psId')
  async adminDailyDashboardReport(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps adminDailyDashboardReport is calling with params psId:${psId} `);
    const result = await this.studentPsService.adminDailyDashboardReport(req.user, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps adminDailyDashboardReport controller > service response: ${(result.Error ? `error: ${result.message}` : `Report data sent successfully`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN', 'MENTOR')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('attendancefromandtoreport/:psId/:from/:to')  //YYYY-MM-DD
  async attendaneFromAndToreport(@Request() req, @Param('psId', ParseIntPipe) psId: number, @Param('from') from: string, @Param('to') to: string) {
    logger.debug(`reqUser: ${req.user.username} studentps attendaneFromAndToreport is calling with params psId:${psId} from: '${from}' to: '${to}' `);
    const result = await this.studentPsService.attendaneFromAndToreport(req.user, psId, from, to);
    logger.debug(`reqUser: ${req.user.username} return in studentps attendaneFromAndToreport controller > service response: ${(result.Error ? `error: ${result.message}` : `Report data sent successfully`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('getreportonmentorsbyps/:psId')
  async getReportOnMentorsByPs(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps getReportOnMentorsByPs is calling with params psId:${psId} `);
    const result = await this.studentPsService.getReportOnMentorsByPs(req.user.username, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps getReportOnMentorsByPs controller > service response: ${(result.Error ? `error: ${result.message}` : `Report data sent successfully`)} `);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('findallstudentsreport/:psId')
  async findAllStudentsReport(@Request() req, @Param('psId', ParseIntPipe) psId: number) {
    logger.debug(`reqUser: ${req.user.username} studentps findAllStudentsReport is calling with params psId:${psId} `);
    const result = await this.studentPsService.findAllStudentsReport(req.user.username, psId);
    logger.debug(`reqUser: ${req.user.username} return in studentps findAllStudentsReport controller > service response: ${(result.Error ? `error: ${result.message}` : `Report data sent successfully`)} `);
    return result;
  }

  /*
    From this, note that all the controllers below are responsible for syncing attendance to various applications, running cron jobs to sync attendance, and sending emails.
  */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post('syncpastdateattendance')
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe())
  async syncPastDateAttendance(@Request() req, @Body() syncPastDateAttendanceDto: SyncPastDateAttendanceDto) {
    const reqUser = req?.user?.username ?? "developer";
    logger.debug(`studentps syncPastDateAttendance is calling with body syncPastDateAttendanceDto: ${JSON.stringify(syncPastDateAttendanceDto)} `);
    const res = await this.studentPsService.syncPastDateAttendance(reqUser, syncPastDateAttendanceDto)
    logger.debug(`studentps syncPastDateAttendance method return in controller > res: ${res}`);
    return res;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post('syncpastdateattendancebetweendates')
  @UsePipes(new ValidationPipe())
  async syncPastDateAttendanceBetweenDates(@Request() req, @Body() syncPastDateAttendanceBetweenDatesDto: SyncPastDateAttendanceBetweenDatesDto) {
    const reqUser = req?.user?.username ?? "developer";
    logger.debug(`studentps syncPastDateAttendance is calling with body syncPastDateAttendanceBetweenDatesDto: ${JSON.stringify(syncPastDateAttendanceBetweenDatesDto)} `);
    const res = await this.studentPsService.syncPastDateAttendanceBetweenDates(reqUser, syncPastDateAttendanceBetweenDatesDto);
    logger.debug(`studentps syncPastDateAttendanceBetweenDates method return in controller > ${typeof res == 'object' ? JSON.stringify(res) : res}`);
    return res;
  }

  //dont change this service
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('attfordbbydate/:date')
  async attByDateForBD(@Param('date') date: string) {
    logger.debug(`studentps attByDateForBD is calling with params date:${date} `);
    const result = await this.studentPsService.attByDateForBD(date);
    logger.debug(`return in studentps attByDateForBD controller > service response: ${(result.Error ? `error: ${result.message}` : `students ${result.payload.length}`)} `);
    return result;
  }

  //dont change this service
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @ApiResponse({ status: 201, description: 'The record has been successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('studentsfulldata')
  async sendDataToDb() {
    logger.debug(`studentps sendDataToDb is calling`);
    const result = await this.studentPsService.sendDataToDb();
    logger.debug(`return in studentps sendDataToDb controller > service response: ${(result.Error ? `error: ${result.message}` : result.message)}
  }`);
    return result;
  }

  // dont try to change below cron jobs, rather then timeings
  @Cron('30 15,16,17,18,20 * * *')
  syncAttendanceToTrinetraCronJobfirst() {
    const kmit_url = (process.env.KMIT_TRINETRA_URL != undefined && process.env.KMIT_TRINETRA_URL !== "")
    const ngit_url = (process.env.NGIT_TRINETRA_URL != undefined && process.env.NGIT_TRINETRA_URL !== "")
    const kmec_url = (process.env.KMEC_TRINETRA_URL != undefined && process.env.KMEC_TRINETRA_URL !== "")
    if (process.env.CRON_JOB_ON.toString() == "true" && kmit_url && ngit_url && kmec_url)
      this.studentPsService.syncAttendanceToTrinetraCronJob();
    else
      logger.alert(`please make sure CRON_JOB_ON = true and All college TRINETRA URL details present in environmental variable`)
  }

  @Cron('0,30 17 * * *')
  sendEmailsToMentorCron() {
    if (process.env.CRON_JOB_ON.toString() == "true" && (process.env.MAIL_SENDER != null || process.env.MAIL_SENDER != undefined) )
      this.studentPsService.sendEmailsToMentorCron()
    else
      logger.alert(`please make sure CRON_JOB_ON is set to true to send mail to mentors and set MAIL_SENDER mail to send mails`)
  }
}
