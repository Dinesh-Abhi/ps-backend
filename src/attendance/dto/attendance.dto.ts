import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { AttendanceEnum } from "src/enums";

// export class AttendanceDto {

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     attendance: string;

    // @ApiProperty({ type: String })
    // @IsNotEmpty()
    // @IsString()
    // mrngattendance: string;

    // @ApiProperty({ type: String })
    // @IsNotEmpty()
    // @IsString()
    // aftattendance: string;
    
    // @ApiProperty({ type: Number })
    // @IsNotEmpty()
    // @IsNumber()
    // psId:number;

    // @ApiProperty({ type: Number })
    // @IsNotEmpty()
    // @IsNumber()
    // studentId:number;
// }

// export class PerformanceDto {

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     performance: string;
    
//     @ApiProperty({ type: Number })
//     @IsNotEmpty()
//     @IsNumber()
//     psId:number;

//     @ApiProperty({ type: Number })
//     @IsNotEmpty()
//     @IsNumber()
//     studentId:number;
// }

export class BulkMarkAttendanceDto{
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    spsId:number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    projectId:number;

    @ApiProperty({ type: 'enum',enum:AttendanceEnum })
    @IsNotEmpty()
    @IsEnum(AttendanceEnum)
    attendance:AttendanceEnum;
}