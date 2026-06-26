import { ApiProperty } from '@nestjs/swagger';

export class OpsOutboxStatusDto {
  @ApiProperty({ example: 0 })
  pending!: number;

  @ApiProperty({ example: 0 })
  processing!: number;

  @ApiProperty({ example: 0 })
  failed!: number;

  @ApiProperty({ example: 0 })
  dead!: number;

  @ApiProperty({ example: 12 })
  processed!: number;
}

export class OpsQueueStatusDto {
  @ApiProperty({ example: 0 })
  waiting!: number;

  @ApiProperty({ example: 0 })
  active!: number;

  @ApiProperty({ example: 0 })
  delayed!: number;

  @ApiProperty({ example: 0 })
  failed!: number;

  @ApiProperty({ example: 12 })
  completed!: number;

  @ApiProperty({ example: 0 })
  paused!: number;
}

export class OpsCacheStatusDto {
  @ApiProperty({ example: 'available', enum: ['available', 'bypassed'] })
  state!: 'available' | 'bypassed';

  @ApiProperty({ example: false })
  circuitOpen!: boolean;

  @ApiProperty({ example: null, nullable: true })
  unavailableUntil!: string | null;

  @ApiProperty({ example: 86400 })
  ttlSeconds!: number;
}

export class OpsStatusResponseDto {
  @ApiProperty({ example: '2026-06-26T18:00:00.000Z' })
  generatedAt!: string;

  @ApiProperty({ type: OpsOutboxStatusDto })
  outbox!: OpsOutboxStatusDto;

  @ApiProperty({ type: OpsQueueStatusDto })
  queue!: OpsQueueStatusDto;

  @ApiProperty({ type: OpsCacheStatusDto })
  cache!: OpsCacheStatusDto;
}
