import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsNumber, IsString, Max, max, Min, MIN } from "class-validator"

export class GroupEnrollDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number

    @ApiProperty({ type: [Number] })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    students: []

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    nominees: string[]
}
export class SPSUpdateDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    studentId: number

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    old_psId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    new_psId: number;
}

export class ChangeGroupDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    studentId: number

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    groupId: number;
}

export class PsDetailsDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    academicyear: number

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    studentyear: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    semester: string;
}

export class AddNewStudentToGroupDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    gId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    studentId: number;
}

export class ReplaceStudentInGroupDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    gId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    newStudentId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    oldStudentSpsId: number;
}

export class MentorStudentdayReportDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    mentorId: number;

    @ApiProperty({ type: String, example: 'YYYY-MM-DD' })
    @IsNotEmpty()
    @IsString()
    date: string;
}

export class AddOrUpdateGithubLinkDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    spsId: number;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    link: string;
}

export class SyncPastDateAttendanceDto{
    previousdate:string    //YYYY-MM-DD
    code:string    //KMIT or NGIT
}

export class SyncPastDateAttendanceBetweenDatesDto{
    startDate:string 
    endDate:string
    code:string
}


export class AddReviewCommentDto{
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    spsId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    comment: string;
}

export class AddMentorReviewCommentDto{
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    spsId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    projectId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    comment: string;
}