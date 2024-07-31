import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateEvaluationscheduleDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    start: Date;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    end: Date;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number;
}

export class UpdateEvaluationscheduleDto{
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    start: Date;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    end: Date;
}
