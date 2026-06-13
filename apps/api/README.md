# API - Tiny URL Challenge

API HTTP construida con NestJS. Es responsable de crear Tiny URLs, resolver codigos cortos, usar Redis como cache y publicar eventos de acceso en BullMQ.

## Responsabilidades

- Validar requests HTTP.
- Crear documentos en `short_urls`.
- Inicializar documentos en `url_stats`.
- Resolver `GET /:code`.
- Exponer estadisticas con `GET /api/v1/stats/:code`.
- Consultar Redis antes de MongoDB.
- Repoblar Redis con TTL cuando hay cache miss.
- Publicar eventos de click en la cola `click-events`.

## Capas principales

```txt
src/
  infrastructure/
    database/
    queue/
  modules/
    click-events/
    stats/
    urls/
      controllers/
      dto/
      repositories/
      schemas/
      services/
```

Flujo de resolucion:

```txt
RedirectController
  -> UrlsService
  -> UrlCacheService
  -> UrlsRepository
  -> ClickEventsProducer
```

## Decisiones de diseno

- Redis se consulta antes que MongoDB para reducir latencia en la resolucion de URLs frecuentes.
- MongoDB conserva la fuente de verdad en `short_urls`; el cache puede expirar sin perder datos.
- La API publica eventos en BullMQ y no espera a que se persistan las estadisticas para redireccionar.
- Los repositorios encapsulan Mongoose para mantener controllers y services enfocados en HTTP y reglas de negocio.

## Endpoints

Crear Tiny URL:

```txt
POST /api/v1/urls
```

Body:

```json
{
  "originalUrl": "https://www.google.com/search?q=nodejs",
  "alias": "mi-alias"
}
```

Resolver Tiny URL:

```txt
GET /:code
```

Consultar estadisticas:

```txt
GET /api/v1/stats/:code
```

Respuesta:

```json
{
  "code": "mi-alias",
  "totalClicks": 3,
  "lastClick": "2026-06-11T23:34:04.308Z"
}
```

Health check:

```txt
GET /health
```

## Swagger

La API expone documentacion OpenAPI en:

```txt
http://localhost:3000/api/docs
```

El JSON de OpenAPI esta disponible en:

```txt
http://localhost:3000/api/docs-json
```

Endpoints documentados:

- `GET /health`
- `POST /api/v1/urls`
- `GET /:code`
- `GET /api/v1/stats/:code`

Swagger aplica solo a la API HTTP. El worker no expone endpoints publicos; consume BullMQ y se documenta en `apps/worker/README.md`.

## Redis

Redis se usa como cache de resolucion.

- Key: `tiny-url:{code}`
- Value: URL original
- TTL: 24 horas

Si Redis falla, la API sigue consultando MongoDB.

## BullMQ

La API publica eventos en la cola:

```txt
click-events
```

Job:

```txt
tiny-url-clicked
```

Payload:

```ts
{
  code: string;
  clickedAt: string;
  ip?: string;
  userAgent?: string;
}
```

Si la publicacion del evento falla, la redireccion no se bloquea.

## Comandos

Desde la raiz:

```powershell
npm run lint:api
npm run test:api
npm run build:api
```
