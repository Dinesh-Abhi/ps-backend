import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, isEnum } from "class-validator";
import { EvaluationGradeEnum } from "src/enums";

export class CreateEvaluationResultDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer1: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer2: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer3: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer4: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer5: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer6: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer7: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer8: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer9: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer10: number;

    @ApiProperty({ type: String })
    comments: string;

    // @ApiProperty({ type: 'enum', enum: EvaluationGradeEnum })
    // @IsNotEmpty()
    // @IsEnum(EvaluationGradeEnum)
    // grade: EvaluationGradeEnum;

    @ApiProperty({ type: Number })
    @IsNotEmpty()    
    @IsNumber()
    grade: number;

    // @ApiProperty({ type: Boolean })
    // @IsNotEmpty()
    // @IsBoolean()
    // eliteflag: boolean;

    @ApiProperty({ type: Number, description: "evaluatorstudentId" }) // evaluatorstudentId ID
    @IsNumber()
    @IsNotEmpty()
    estudentId: number;
}

export class UpdateResultCommentDto {

    @ApiProperty({ type: Number }) // EvaluatorResults ID
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    comments: string;
}

export class CreateGroupResultDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer1: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer2: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer3: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer4: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer5: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer6: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer7: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer8: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer9: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    answer10: number;

    @ApiProperty({ type: String })
    comments: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    groupId: number;
    
    @ApiProperty({ type: Number })
    @IsNotEmpty()    
    @IsNumber()
    grade: number;


    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    escheduleId: number;
}

export class GropuResultUpdateDto {

    @ApiProperty({ type: Number }) // EvaluatorResults ID
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    comments: string;
}