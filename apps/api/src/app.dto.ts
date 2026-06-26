import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'healthy' })
  status!: string;

  @ApiProperty({ example: 'Health is ok' })
  message!: string;
}

export class ReadinessChecksDto {
  @ApiProperty({ example: 'up' })
  mongodb!: string;
}

export class ReadinessResponseDto {
  @ApiProperty({ example: 'ready' })
  status!: string;

  @ApiProperty({ example: 'API is ready' })
  message!: string;

  @ApiProperty({ type: ReadinessChecksDto })
  checks!: ReadinessChecksDto;
}
