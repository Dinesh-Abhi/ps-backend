import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import logger from 'src/loggerfile/logger';
import * as fs from 'fs';
import * as path from 'path';
const moment = require('moment');

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
            user: `${process.env.MAIL_SENDER}`,
            pass: `${process.env.MAIL_PASSWORD}`
        },
    });

    async sendOTPEmail(username: string, email: string, otp: number): Promise<any> { //this prototype is used to send the otp throw mail to reset password
        const mailOptions = {
            from: `${process.env.APP_NAME} <${process.env.MAIL_SENDER}>`,
            to: email, //reciver mail
            subject: 'Email OTP Verification',
            html: `
        <p>Dear ${username} </p><br/>
        <p>${otp} is your one time password (OTP). Please do not share the otp with others.</p>
        <p>Regards,</p><br/>
        <p>Team {service provider name}</p>
      `,
        };

        try {
            logger.debug('Email sendOTPEmail started');
            const info = await this.transporter.sendMail(mailOptions);
            logger.debug(`Email sent:${info.response}`);
            if (info)
                return { Error: false, message: "Email sent" };
            throw info;
        } catch (error) {
            logger.error(`Error in sendOTPEmail error: ${(typeof error == 'object' ? error.message : error)}`);
            return { Error: true, message: (typeof error == 'object' ? error.message : error) };
        }
    }

    async sendpasswordEmail(reqUsername: string, studentUsername: string, studentName: string, studentPassword: string, studentEmail: string): Promise<any> {
        const mailOptions = {
            from: `${process.env.APP_NAME} <${process.env.MAIL_SENDER}>`,
            to: studentEmail, //reciver mail
            subject: 'Your Project School Account credentials',
            html: `
       <p>Dear ${studentName},</p>
        <p>Your account password for Project School has been changed successfully.</p>
        <p>Your Username is: <strong>${studentUsername}</strong></p><br/>
        <p>Your new password is: <strong>${studentPassword}</strong></p><br/>
        <p>Regards,</p>
        <p>Team ${process.env.APP_NAME}</p>
      `,
        };

        try {
            logger.debug(`reqUser: ${reqUsername} Email sendpasswordEmail started`);
            const info = await this.transporter.sendMail(mailOptions);
            logger.debug(`reqUser: ${reqUsername} Email sendpasswordEmail sent:${info.response}`);
            if (info)
                return { Error: false, message: "Email sent" };
            throw info;
        } catch (error) {
            logger.error(`reqUser: ${reqUsername} error: ${(typeof error == 'object' ? error.message : error)} > Error in sendpasswordEmail email`);
            return { Error: true, message: (typeof error == 'object' ? error.message : error) };
        }
    }

    async cronEmail(replyfrom: string, message: string, response?: any) {
        const logdir = path.join(__dirname + '../../../logs')
        const date = moment().format('YYYY-MM-DD')
        const mailOptions = {
            from: `${process.env.APP_NAME} <${process.env.MAIL_SENDER}>`,
            to: process.env.CRON_MAIL, //reciver mail
            subject: 'PS Cron',
            html: `
            <p>From ${replyfrom}</p><br>
            <p>message: ${message}</P><br>
            <p>response \n${response ? response?.map(r => `<p>${JSON.stringify(r)}</p>`).join('<br>') : ''} </p><br>
            <p>today's logger file</p>
            `,
            attachments: [
                {
                    filename: 'daily_file.txt',
                    content: fs.readFileSync(`${logdir}/rotate-${date}.log`),
                },
            ],
        };

        try {
            logger.debug(`Email cronEmail started`);
            const info = await this.transporter.sendMail(mailOptions);
            logger.debug(`Email cronEmail sent:${info.response}`);
            if (info)
                return { Error: false, message: "Email sent" };
            else
                throw info;
        } catch (error) {
            logger.error(`error: ${(typeof error == 'object' ? error.message : error)} > Error in cronEmail email`);
            return { Error: true, message: (typeof error == 'object' ? error.message : error) };
        }
    }

    async sendMentorAttendanceEmail(jsonData: any) {
        const mailOptions = {
            from: `${process.env.APP_NAME} <${process.env.MAIL_SENDER}>`,
            to: jsonData?.mentor_mail,
            subject: 'Daily Attendance Update and Reminder',
            html: `
            <p>Dear PS Mentor,</p>
            <p>This email serves as your daily attendance update and reminder to ensure that all student attendance is marked before <strong>6 P.M.</strong> today.</p>
            <p>Please find today's student attendance details below:</p>
            <p><strong>College:</strong> ${jsonData?.college}</p>
            <p><strong>Academic Year:</strong> ${jsonData?.ps_AY}</p>
            <p><strong>Student Year:</strong> ${jsonData?.ps_stuyear}</p>
            <p><strong>Semester:</strong> ${jsonData?.ps_sem}</p>
            <p><strong>Project Title:</strong> ${jsonData?.project_title}</p>
            <p><strong>Attendance Details:</strong></p>
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Group Name</th>
                        <th>Attendance</th>
                    </tr>
                </thead>
                <tbody>
                    ${jsonData?.attendance.map(att => `
                        <tr>
                            <td>${att?.rollno}</td>
                            <td>${att?.name}</td>
                            <td>${att?.groupname}</td>
                            <td>${att?.attendance === 1 ? 'Present' : att?.attendance === 0 ? 'Absent' : 'Not Marked'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table></br>
            <p><strong>Note:</strong> Please remember to mark the attendance before <strong>6 P.M.</strong> Any student not marked will be considered absent after this time.</p>
            <p>Regards,</p>
            <p>PS Team</p>
        `,
        };

        try {
            logger.debug('Sending mentor attendance email');
            const info = await this.transporter.sendMail(mailOptions);
            logger.debug(`Email sent for mentor ${jsonData.mentor_name} response: ${info.response}`);
            return { Error: false, message: "Email sent" };
        } catch (error) {
            logger.error(`Error in sendMentorAttendanceEmail for ${jsonData.mentor_name} error: ${error.message}`);
            return { Error: true, message: error.message };
        }
    }
}