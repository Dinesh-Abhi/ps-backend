import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { SType } from "src/enums";
import { Style } from "util";

export class GroupDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  psId: number;

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true }) // Check each element in the array to be a number
  studentIds: number[];
}

export class AssignMentorDto {
  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  projectIds: number[];

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  psId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  mentorId: number;
}

export class EroleprojectDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  psId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;
}

export class EvaluatorAssignDto {

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  groupIds: number[];

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  evaluatorId: number;
}

export class BulkEvaluatorAssignDto {

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  groupname: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  evaluatorusername: string;
}


export class UpdateGroupStatusDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ type: 'enum', enum: SType })
  @IsNotEmpty()
  @IsEnum(SType)
  status: SType;
}

export class SwapProjectDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  gId1: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  gId2: number;
}

export class TransferProjectDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  fromGroupId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  toGroupId: number;
}

export class AssignProjectDto{
  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;
}