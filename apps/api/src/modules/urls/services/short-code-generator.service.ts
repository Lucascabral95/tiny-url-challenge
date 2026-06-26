import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH } from '../urls.constants';

const generateShortCode = customAlphabet(
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
);

@Injectable()
export class ShortCodeGeneratorService {
  generate(): string {
    return generateShortCode();
  }
}
