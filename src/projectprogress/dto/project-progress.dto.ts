import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class StudentPPCreateDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    achievements: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    plans: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    spsId: number

}

export class PPUpdateStudentDto {

    @ApiProperty({ type: Number,description:"ProjectProgressId" })
    @IsNotEmpty()
    @IsNumber()
    ppId: number

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    achievements: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    plans: string
}
export class UpdateCommentsPpDto{
    @ApiProperty({ type: Number,description:"ProjectProgressId" })
    @IsNotEmpty()
    @IsNumber()
    ppId: number

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    comments: string
}

export class EndorseStudentsPpDto{
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    ppId: number

    @ApiProperty({ type: String })
    comments: any
}

export class EvaluatorPPCreateDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    comments: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    spsId: number

    // @ApiProperty({ type: Number })
    // @IsNotEmpty()
    // @IsNumber()
    // projectId: number
}