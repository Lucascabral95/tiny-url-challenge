import { validate } from 'class-validator';
import { CreateShortUrlDto } from './create-short-url.dto';

describe('CreateShortUrlDto', () => {
  it('should accept public http and https URLs', async () => {
    await expect(
      validateDto('https://www.google.com/search?q=nodejs'),
    ).resolves.toHaveLength(0);
    await expect(validateDto('http://example.com')).resolves.toHaveLength(0);
  });

  it.each([
    'ftp://example.com',
    'http://localhost:3000',
    'http://api.local',
    'http://mongo',
    'http://127.0.0.1',
    'http://10.0.0.1',
    'http://172.16.0.1',
    'http://192.168.1.10',
    'http://169.254.169.254',
    'http://[::1]',
    'http://[fd00::1]',
    'http://[fe80::1]',
  ])('should reject non-public URL %s', async (originalUrl) => {
    const errors = await validateDto(originalUrl);

    expect(errors).not.toHaveLength(0);
  });
});

async function validateDto(originalUrl: string) {
  const dto = new CreateShortUrlDto();
  dto.originalUrl = originalUrl;

  return validate(dto);
}
