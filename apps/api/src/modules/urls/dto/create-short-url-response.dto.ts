import { ApiProperty } from '@nestjs/swagger';

export class CreateShortUrlResponseDto {
  @ApiProperty({ example: 'mi-alias' })
  code!: string;

  @ApiProperty({ example: 'https://www.google.com/search?q=nodejs' })
  originalUrl!: string;

  @ApiProperty({ example: 'http://localhost:3000/mi-alias' })
  shortUrl!: string;
}
