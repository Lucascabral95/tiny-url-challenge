import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';

export const SWAGGER_PATH = 'api/docs';
export const SWAGGER_JSON_PATH = 'api/docs-json';

const VERSIONED_SWAGGER_PATHS = new Set(['/urls', '/stats/{code}']);

export function setupSwagger(app: INestApplication, apiPrefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('Tiny URL API')
    .setDescription(
      'HTTP API para crear Tiny URLs, resolver codigos cortos y consultar estadisticas.',
    )
    .setVersion('1.0.0')
    .addTag('health', 'Estado basico de la API')
    .addTag('urls', 'Creacion de Tiny URLs')
    .addTag('redirects', 'Resolucion de codigos cortos')
    .addTag('stats', 'Estadisticas de accesos')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });
  const documentWithPublicPaths = applyApiPrefixToSwaggerPaths(
    document,
    apiPrefix,
  );

  SwaggerModule.setup(SWAGGER_PATH, app, documentWithPublicPaths, {
    customSiteTitle: 'Tiny URL API Docs',
    jsonDocumentUrl: `/${SWAGGER_JSON_PATH}`,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

export function applyApiPrefixToSwaggerPaths(
  document: OpenAPIObject,
  apiPrefix: string,
): OpenAPIObject {
  const normalizedPrefix = normalizePathPrefix(apiPrefix);
  const paths = Object.entries(document.paths).reduce<OpenAPIObject['paths']>(
    (accumulator, [path, pathItem]) => {
      const publicPath = VERSIONED_SWAGGER_PATHS.has(path)
        ? `${normalizedPrefix}${path}`
        : path;

      accumulator[publicPath] = pathItem;

      return accumulator;
    },
    {},
  );

  return {
    ...document,
    paths,
  };
}

function normalizePathPrefix(prefix: string): string {
  return `/${prefix.replace(/^\/+|\/+$/g, '')}`;
}
