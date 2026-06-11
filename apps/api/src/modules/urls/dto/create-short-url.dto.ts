import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl({ require_protocol: true })
  originalUrl!: string;

  @IsOptional()
  @IsString()
  @Length(3, 32)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'alias can only contain letters, numbers, underscores and hyphens',
  })
  alias?: string;
}
