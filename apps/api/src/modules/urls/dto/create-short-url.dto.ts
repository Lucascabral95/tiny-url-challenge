import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShortUrlDto {
  @ApiProperty({
    example: 'https://www.google.com/search?q=nodejs',
    description: 'URL original que sera redireccionada por la Tiny URL.',
  })
  @IsUrl({ require_protocol: true })
  originalUrl!: string;

  @ApiPropertyOptional({
    example: 'mi-alias',
    description:
      'Alias opcional. Si no se envia, la API genera un codigo corto.',
    minLength: 3,
    maxLength: 32,
    pattern: '^[A-Za-z0-9_-]+$',
  })
  @IsOptional()
  @IsString()
  @Length(3, 32)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'alias can only contain letters, numbers, underscores and hyphens',
  })
  alias?: string;
}
