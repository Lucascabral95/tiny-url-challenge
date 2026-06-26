import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPublicUrl } from '../../../common/validators/is-public-url.decorator';

export class CreateShortUrlDto {
  @ApiProperty({
    example: 'https://www.google.com/search?q=nodejs',
    description:
      'URL publica http/https que sera redireccionada por la Tiny URL. No se permiten hosts locales o redes privadas.',
  })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'originalUrl must be a valid http or https URL' },
  )
  @IsPublicUrl()
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
