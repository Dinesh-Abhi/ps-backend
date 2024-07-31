import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RType } from "src/enums";

export class UserMasterDto
{
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ enum: RType })
    @IsNotEmpty()
    @IsEnum(RType)
    role: RType;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    collegeId: number;

}

export class UpdateUserMasterDto {

    @ApiProperty({ type: Number, description: "userId" })
    @IsNotEmpty()
    @IsString()
    id: number;
    
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ enum: RType })
    @IsNotEmpty()
    @IsEnum(RType)
    role: RType;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;

}
export class BulkUpdateUserMasterDto {
    
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ enum: RType })
    @IsNotEmpty()
    @IsEnum(RType)
    role: RType;

    @ApiProperty({ type: String })
    password: string;
}

export class ChangePasswordDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;
}

export class ResetPasswordDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    oldpassword: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    newpassword: string;
}

// export class PassUpdateUserMasterDto
// {
//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     username: string;

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     password: string;
// }

// export class UpdatePasswordForStudentTeacherDto
// {
//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     username: string;

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     oldpassword: string;

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     newpassword: string;
// }

// export class VerifyOTPUserMasterDto {

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsEmail()
//     email: string;

//     @ApiProperty({ type: Number })
//     @IsNotEmpty()
//     @IsNumber()
//     otp: number;
// }

// export class ForgotPasswordUserMasterDto{

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsEmail()
//     email: string;

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     password: string;
// }