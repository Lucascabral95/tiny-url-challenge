import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

const shortCodeAlphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateShortCode = customAlphabet(shortCodeAlphabet, 8);

@Injectable()
export class ShortCodeGeneratorService {
  generate(): string {
    return generateShortCode();
  }
}
