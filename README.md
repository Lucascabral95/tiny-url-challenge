# Tiny URL Challenge

Monorepo para un sistema Tiny URL desarrollado con Node.js, TypeScript, NestJS, MongoDB, Redis y BullMQ.

El objetivo del proyecto es demostrar una arquitectura backend clara, separacion por capas, cache con Redis y procesamiento asincronico de eventos mediante cola.

## Arquitectura

```txt
apps/
  api/      API HTTP con NestJS
  worker/   Procesador asincronico de eventos
  web/      Frontend Next.js para probar el flujo
```

Flujo principal:

```txt
POST /api/v1/urls
  -> crea short_urls
  -> inicializa url_stats

GET /:code
  -> busca en Redis
  -> si no existe, busca en MongoDB
  -> repuebla Redis con TTL
  -> publica evento en BullMQ o lo guarda en outbox si falla
  -> redirecciona

worker
  -> consume eventos de BullMQ
  -> procesa eventos pendientes del outbox
  -> guarda click_events
  -> actualiza url_stats

GET /api/v1/stats/:code
  -> lee url_stats
  -> devuelve totalClicks y lastClick
```

## Stack

- Node.js
- TypeScript
- NestJS
- Next.js
- Sass
- MongoDB
- Redis
- BullMQ
- Mongoose

## Decisiones tecnicas

- **BullMQ**: se usa porque integra bien con Node.js/NestJS, corre sobre Redis y permite reintentos, backoff y procesamiento asincronico sin bloquear la request de redireccion.
- **Redis como cache**: acelera la resolucion de `GET /:code`. MongoDB sigue siendo la fuente de verdad, y Redis se repuebla con TTL cuando hay cache miss.
- **Fallback de Redis**: si Redis cache falla, la API abre un circuit breaker temporal y resuelve desde MongoDB para no degradar toda la aplicacion por una dependencia de cache.
- **`url_stats` materializado**: evita calcular estadisticas recorriendo todos los eventos en cada consulta. El worker mantiene este documento actualizado por cada click.
- **Outbox de eventos**: si falla la publicacion en BullMQ, la API persiste el click en `click_event_outbox`. El worker lo recupera luego de forma idempotente usando `eventId`; si agota reintentos, queda en estado `dead` para inspeccion.
- **Codigos cortos resilientes**: los codigos generados se verifican contra MongoDB y se reintentan ante colisiones. El indice unico sigue siendo la garantia final frente a condiciones de carrera.

## Arquitectura de datos

- `short_urls`: guarda el codigo corto, URL original, alias opcional y timestamps.
- `click_events`: guarda cada acceso procesado por el worker con codigo, fecha, IP y User-Agent cuando estan disponibles.
- `click_event_outbox`: guarda clicks pendientes cuando BullMQ no esta disponible o falla la publicacion del evento; los eventos agotados quedan como `dead`.
- `url_stats`: guarda una vista materializada por codigo con `totalClicks` y `lastClick`.

## Alcance y trade-offs

- No se implementa listado de URLs porque no forma parte del challenge y abriria decisiones de paginacion, filtros y exposicion de datos.
- No se implementa autenticacion porque el objetivo es evaluar arquitectura backend, cache, cola y persistencia asincronica.
- No se agregan tests automatizados del frontend porque el PDF indica que no sera evaluado; el frontend se valida con lint, build y prueba manual end-to-end.

## Variables de entorno

El proyecto usa un unico `.env` en la raiz.

```env
API_PORT=3000
WEB_PORT=3001
MONGO_URI=mongodb://mongo:27017/tiny-url
REDIS_HOST=redis
REDIS_PORT=6379
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Crear el archivo local desde el ejemplo:

```powershell
Copy-Item .env.example .env
```

Nota: el frontend local usa `http://localhost:3000` como fallback si no encuentra `NEXT_PUBLIC_API_URL`.

## Instalacion desde cero

Clonar el repositorio:

```powershell
git clone https://github.com/Lucascabral95/tiny-url-challenge.git
cd tiny-url-challenge
```

Instalar dependencias de las aplicaciones:

```powershell
npm --prefix apps/api install
npm --prefix apps/worker install
npm --prefix apps/web install
```

Crear variables de entorno:

```powershell
Copy-Item .env.example .env
```

## Ejecucion con Docker

Requisitos:

- Docker Desktop levantado.
- Node.js instalado para ejecutar los scripts npm.
- Archivo `.env` creado en la raiz del proyecto.

Si no existe `.env`, usar `.env.example` como base.

Levantar backend, worker, MongoDB y Redis:

```powershell
npm run docker:up
```

Este comando ejecuta:

```powershell
docker compose up --build -d
```

Servicios levantados:

- `api`: NestJS API en `http://localhost:3000`
- `worker`: consumidor asincronico de eventos
- `mongo`: base de datos en puerto `27017`
- `redis`: cache y backend de BullMQ en puerto `6379`

Ver estado de los contenedores:

```powershell
docker compose ps
```

Ver logs:

```powershell
npm run docker:logs
```

Apagar servicios:

```powershell
npm run docker:down
```

Probar que la API responde:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "healthy",
  "message": "Health is ok"
}
```

Levantar frontend aparte:

```powershell
npm run dev:web
```

El frontend queda disponible en:

```txt
http://localhost:3001
```

Desde la pantalla web se puede crear una Tiny URL, copiarla, abrirla y consultar sus estadisticas.

## Documentacion Swagger

La API expone documentacion OpenAPI con Swagger UI.

Con los servicios levantados, abrir:

```txt
http://localhost:3000/api/docs
```

El documento JSON esta disponible en:

```txt
http://localhost:3000/api/docs-json
```

Swagger documenta los endpoints HTTP de `apps/api`:

- `GET /health`
- `POST /api/v1/urls`
- `GET /:code`
- `GET /api/v1/stats/:code`

El worker no tiene Swagger porque no expone endpoints publicos; consume eventos de BullMQ y se documenta en su README.

## Probar el flujo completo

1. Levantar backend, worker, MongoDB y Redis:

```powershell
npm run docker:up
```

2. Levantar frontend:

```powershell
npm run dev:web
```

3. Abrir:

```txt
http://localhost:3001
```

4. Desde la pantalla:

- Crear una Tiny URL con una URL original.
- Copiar o abrir el enlace corto generado.
- Consultar estadisticas del codigo.

Tambien se puede probar por API:

```powershell
$body = @{
  originalUrl = "https://www.google.com/search?q=nodejs"
  alias = "mi-alias"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:3000/api/v1/urls `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Resolver la Tiny URL:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/mi-alias -MaximumRedirection 0
```

Consultar estadisticas:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/v1/stats/mi-alias
```

## Endpoints

Health check:

```txt
GET /health
```

Crear Tiny URL:

```txt
POST /api/v1/urls
```

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

Ejemplo:

```txt
GET /mi-alias
```

Consultar estadisticas:

```txt
GET /api/v1/stats/:code
```

Ejemplo de respuesta:

```json
{
  "code": "mi-alias",
  "totalClicks": 3,
  "lastClick": "2026-06-11T23:34:04.308Z"
}
```

## Comandos utiles

```powershell
npm run lint:api
npm run lint:worker
npm run lint:web
npm run test:api
npm run test:worker
npm run test:backend
npm run build:api
npm run build:worker
npm run build:web
npm run verify
```

`npm run verify` ejecuta lint, tests y build donde corresponde. El frontend no tiene tests automatizados porque el challenge no evalua frontend; se valida con lint y build.

## Estado actual

Implementado:

- Creacion de Tiny URLs.
- Persistencia en `short_urls`.
- Estadisticas materializadas en `url_stats`.
- Resolucion con cache Redis.
- Circuit breaker para degradar a MongoDB si Redis cache falla.
- Publicacion asincronica de eventos con BullMQ.
- Outbox persistente con estado `dead` para no perder clicks si falla la publicacion en BullMQ.
- Worker para persistir `click_events` y actualizar `url_stats`.
- Endpoint de estadisticas `GET /api/v1/stats/:code`.
- Frontend Next.js para crear Tiny URLs, abrir enlaces y consultar estadisticas.
