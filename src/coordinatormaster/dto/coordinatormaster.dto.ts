import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CoordinatorMasterDto{
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


export class CoordinatorUpdateDto{

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  coordinatorId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  // @ApiProperty({ type: String })
  // @IsNotEmpty()
  // @IsString()
  // username: string;

  // @ApiProperty({ type: String })
  // @IsNotEmpty()
  // @IsString()
  // password: string;
}