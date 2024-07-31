import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsEmail } from "class-validator";
import { SType } from "src/enums";

export class MentorMasterDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;

    //----------------

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    collegeId: number;

    @ApiProperty({ type: String })
    @IsEmail()
    email: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;

}

export class MentorUpdateDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    mentorId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: String })
    @IsEmail()
    email: string;

    // @ApiProperty({ type: String })
    // @IsNotEmpty()
    // @IsString()
    // username: string;

    // @ApiProperty({ type: String })
    // @IsNotEmpty()
    // @IsString()
    // password: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    collegeId: number;

    @ApiProperty({ enum: SType })
    @IsEnum(SType)
    @IsNotEmpty()
    status: SType;
}

export class MentorProfileUpdateDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    mentorId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}