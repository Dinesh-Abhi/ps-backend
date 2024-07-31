import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AuditLogDto {

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  info: string;
}

