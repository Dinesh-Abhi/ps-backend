import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { RType } from "src/enums";

export class AdminMasterDto {

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  collegeId: number;

}


export class AdminMasterUpdateDto {

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  // @ApiProperty({ type: String })
  // @IsNotEmpty()
  // @IsString()
  // password: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  collegeId: number;

}

