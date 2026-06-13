import { ApiProperty } from '@nestjs/swagger';

export class StatsResponseDto {
  @ApiProperty({ example: 'mi-alias' })
  code!: string;

  @ApiProperty({ example: 3 })
  totalClicks!: number;

  @ApiProperty({
    example: '2026-06-11T23:34:04.308Z',
    nullable: true,
    type: String,
  })
  lastClick!: Date | null;
}
