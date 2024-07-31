import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, isNotEmpty } from "class-validator";
import { SType } from "src/enums";

export class StudentMasterDto {

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  // @IsNotEmpty()
  // @IsEmail()
  email: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  studentyear: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ type: String })
  @IsString()
  CGPA: string;

}

export class UpdateStudentMasterDto {

  @ApiProperty({ type: Number, description: "studentid" })
  @IsNotEmpty()
  @IsNumber()
  id: number; //studentid

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  studentyear: number;

  @ApiProperty({ type: String })
  @IsString()
  CGPA: string;
}


export class StudentMasterBulkDto {

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  section: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  studentyear: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  academicyear: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  collegeId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  semester: string;

}

export class StudentProfileUpdateDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  email: string;
}
export class StudentMasterUpdateDto {

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  section: string;

  @ApiProperty({ type: String })
  email: string;

  // @ApiProperty({ type: String })
  // @IsString()
  // password: string;
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  old_academicyear: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  old_collegeId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  old_semester: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  old_studentyear: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  new_studentyear: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  new_academicyear: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  new_collegeId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  new_semester: string;

  @ApiProperty({ enum: SType })
  @IsEnum(SType)
  @IsNotEmpty()
  status: SType;

}

export class CreateVirtualStudentsDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  academicyear: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  collegeId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  semester: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  studentyear: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  noofstudents: number;
}