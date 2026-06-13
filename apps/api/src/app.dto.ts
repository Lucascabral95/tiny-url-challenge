import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'healthy' })
  status!: string;

  @ApiProperty({ example: 'Health is ok' })
  message!: string;
}
