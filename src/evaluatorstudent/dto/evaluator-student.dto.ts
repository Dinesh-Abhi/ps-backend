import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString } from "class-validator";
import { EvaluationType } from "src/enums";

export class EvaluatorStudentDto {
    @ApiProperty({ type: [Number] })
    @IsNumber({}, { each: true })
    @IsArray()
    groupId: number;

    @ApiProperty({ type: [Number] })
    @IsNumber({}, { each: true })
    @IsArray()
    spsIds: number[];

    @ApiProperty({ type: 'enum', enum: EvaluationType })
    @IsNotEmpty()
    @IsEnum(EvaluationType)
    type: EvaluationType;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    escheduleId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    evaluatorId: number;
}

export class CreateEvaluatorStudentDto {
    @ApiProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    groupId: number;

    @ApiProperty({ type: [Number] })
    @IsNumber({}, { each: true })
    @IsArray()
    @IsNotEmpty()
    spsIds: number[];

    @ApiProperty({ type: 'enum', enum: EvaluationType })
    @IsNotEmpty()
    @IsEnum(EvaluationType)
    type: EvaluationType;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    escheduleId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    evaluatorId: number;
}

export class BulkCreateEvaluatorIndividualStudentDto {
    @ApiProperty({ type: [Number] })
    @IsNumber({}, { each: true })
    @IsArray()
    @IsNotEmpty()
    spsIds: number[];

    @ApiProperty({ type: 'enum', enum: EvaluationType })
    @IsNotEmpty()
    @IsEnum(EvaluationType)
    type: EvaluationType;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    escheduleId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    evaluatorId: number;
}

export class BulkCreateEvaluatorGroupStudentDto {
    @ApiProperty({ type: [Number] })
    @IsNumber({}, { each: true })
    @IsArray()
    @IsNotEmpty()
    groupIds: number[];

    @ApiProperty({ type: 'enum', enum: EvaluationType })
    @IsNotEmpty()
    @IsEnum(EvaluationType)
    type: EvaluationType;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    escheduleId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    evaluatorId: number;
}
export class BulkUploadEvaluatorIndividualWiseDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    rollno: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    escheduleId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    evaluatorname: string;
}

export class BulkUploadEvaluatorGroupWiseDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    groupName: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    escheduleId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    evaluatorname: string;
}

export class UpdateEvaluatorToStudentDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    estudentId: number;

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    groupId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    evalscheduleId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    evaluatorId: number;
}

export class UpdateEvaluatorStudentTypeDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    estudentId: number;

    @ApiProperty({ type: 'enum', enum: EvaluationType })
    @IsNotEmpty()
    @IsEnum(EvaluationType)
    evaluationtype: EvaluationType;
}