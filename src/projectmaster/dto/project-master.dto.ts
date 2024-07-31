import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { SType } from "src/enums"

export class ProjectDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    title: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    category: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    problemstatement: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    techstack: string

    @ApiProperty({ type: 'longtext' })
    // @IsString()
    reflink: string

    // @ApiProperty({ type: String })
    // @IsNotEmpty()
    // @IsString()
    // code: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    maxgroups: number
}

export class ProjectMasterDto{
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    collegeId: number

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    semester: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    academicyear: number

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    studentyear: number

    @ApiProperty({ type: ProjectDto })
    @IsNotEmpty()
    project: ProjectDto
}

export class AssignMentorDto{
    @ApiProperty({ type: [Number] })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    projectIds: number[];

    @ApiProperty({ type: [Number] })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    mentorIds: number[];
}

export class EditAssignMentorDto{
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    projectId: number;

    @ApiProperty({ type: [Number] })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    mentorIds: number[];
}

// export class ProjectMasterBulkDto{
//     @ApiProperty({ type: Number })
//     @IsNotEmpty()
//     @IsNumber()
//     collegeId: number

//     @ApiProperty({ type: Number })
//     @IsNotEmpty()
//     @IsNumber()
//     academicyear: number

//     @ApiProperty({ type: String })
//     @IsNotEmpty()
//     @IsString()
//     semester: string

//     @ApiProperty({ type: Number })
//     @IsNotEmpty()
//     @IsNumber()
//     studentyear: number

//     @ApiProperty({ type: [ProjectDto]})
//     @IsNotEmpty()
//     @IsArray()
//     projects: ProjectDto[]
// }
export class UpdateProjectMasterDto {

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    id: number

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    title: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    category: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    problemstatement: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    techstack: string

    @ApiProperty({ type: 'longtext' })
    // @IsString()
    reflink: string


    @ApiProperty({ enum: SType })
    @IsNotEmpty()
    @IsEnum(SType)
    status: SType
    // @ApiProperty({ type: String })
    // @IsNotEmpty()
    // @IsString()
    // code: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    maxgroups: number
}


export class ProjectMasterBulkDto {

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    title: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    category: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    problemstatement: string

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    techstack: string

    @ApiProperty({ type: 'longtext' })
    // @IsString()
    reflink: string

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    maxgroups: number
  
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
    studentyear:number
  }

  export class DummyProjectDto{
   @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ type: String })
    // @IsNotEmpty()
    @IsString()
    problemstatement: string;

    @ApiProperty({ type: String })
    // @IsNotEmpty()
    @IsString()
    category: string;

    @ApiProperty({ type: String })
    // @IsNotEmpty()
    @IsString()
    techstack: string;

    @ApiProperty({ type: 'longtext' })
    // @IsString()
    reflink: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    maxgroups: number;
  
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
    studentyear:number
  }