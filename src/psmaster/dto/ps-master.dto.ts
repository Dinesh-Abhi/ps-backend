import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested, isNotEmpty } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";
import { PSSType } from 'src/enums';
import { Type } from 'class-transformer';
export class PsMasterDto {

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  collegeId: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  academicyear: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  studentyear: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  groupcount: number;
}

export class PsUpdateDto{
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  psId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  collegeId: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  academicyear: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  studentyear: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  groupcount: number;

  @ApiProperty({ enum: PSSType })
  @IsEnum(PSSType)
  @IsNotEmpty()
  status: PSSType;

}

export class ScheduleProjectEnrollDto{

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  psId: number;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  project_start: Date;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  project_end: Date;
}

export class ScheduleGroupEnrollDto{
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  psId: number;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  group_start: Date;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  group_end: Date;
}