import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { MilestoneType } from "src/enums"

export class MilestoneUpdateDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    id: number

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    description: string

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @IsBoolean()
    enable: boolean

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    lastdate: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    weightage: number
}

export class MilestoneCreateDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    psId: number

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    description: string

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @IsBoolean()
    enable: boolean

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    lastdate: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    weightage: number
}

export class BulkUpdateMilestonesDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    milestonename: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    description: string
    
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    weightage: number

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @IsBoolean()
    enable: boolean

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    lastdate: string

    @ApiProperty({ type: [Number] })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    projectIds: number[]

}