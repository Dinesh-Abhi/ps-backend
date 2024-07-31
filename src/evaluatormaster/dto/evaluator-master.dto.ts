import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsArray, IsEnum } from "class-validator";
import { SType } from "src/enums";

export class EvaluatorMasterDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string; //rollno

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    password: string;

}

export class EvaluatorUpdateDto {
    @ApiProperty({ type: Number }) //evaluatorId
    @IsNotEmpty()
    @IsNumber()
    evaluatorId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: 'enum',enum:SType })
    @IsNotEmpty()
    @IsEnum(SType)
    status: SType;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    username: string;

    // @ApiProperty({ type: String })
    // @IsNotEmpty()
    // @IsString()
    // password: string;
}

export class AssignStudentsDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    evaluatorId: number;

    @ApiProperty({ type: [Number] })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    studentIds: number[];
}


export class BulkAssignStudentsDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    studentyear: number;

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

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    evaluatorusername: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    studentusername: string;
}