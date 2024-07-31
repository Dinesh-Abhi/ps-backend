import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class MilestoneStudentPsCreateOrUpdateDto {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    spsId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    msId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    link: string;
}

export class AddCommentsByMentor {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    mspsId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    comments: string;
}

export class AddMakrsToMilestoneByMentor {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    mentorId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    mspsId: number;

    @ApiProperty({ type: String, nullable: true })
    @IsOptional()
    @IsString()
    comments?: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    @Max(100)
    @Min(0)
    @IsNotEmpty()
    marks: number
}