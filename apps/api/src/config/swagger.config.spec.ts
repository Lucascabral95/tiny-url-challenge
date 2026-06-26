import type { OpenAPIObject } from '@nestjs/swagger';
import { applyApiPrefixToSwaggerPaths } from './swagger.config';

describe('applyApiPrefixToSwaggerPaths', () => {
  it('should prefix only versioned API routes', () => {
    const document = {
      paths: {
        '/health': {},
        '/ready': {},
        '/urls': {},
        '/{code}': {},
        '/stats/{code}': {},
      },
    } as OpenAPIObject;

    const result = applyApiPrefixToSwaggerPaths(document, 'api/v1');

    expect(Object.keys(result.paths)).toEqual([
      '/health',
      '/ready',
      '/api/v1/urls',
      '/{code}',
      '/api/v1/stats/{code}',
    ]);
  });
});
