import { ApiProperty } from "@nestjs/swagger";

export class RefreshDto {
  @ApiProperty({ type: String })
  refreshToken: string;
}
