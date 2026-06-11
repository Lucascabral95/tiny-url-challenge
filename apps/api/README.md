# API - Tiny URL Challenge

API HTTP construida con NestJS. Es responsable de crear Tiny URLs, resolver codigos cortos, usar Redis como cache y publicar eventos de acceso en BullMQ.

## Responsabilidades

- Validar requests HTTP.
- Crear documentos en `short_urls`.
- Inicializar documentos en `url_stats`.
- Resolver `GET /:code`.
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

Health check:

```txt
GET /health
```

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
npm --prefix apps/api test -- --runInBand
npm --prefix apps/api run build
```
