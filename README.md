# Tiny URL Challenge

Monorepo para un sistema Tiny URL desarrollado con Node.js, TypeScript, NestJS, MongoDB, Redis y BullMQ.

El objetivo del proyecto es demostrar una arquitectura backend clara, separacion por capas, cache con Redis y procesamiento asincronico de eventos mediante cola.

## Arquitectura

```txt
apps/
  api/      API HTTP con NestJS
  worker/   Procesador asincronico de eventos
  web/      Frontend minimo con Next.js
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
  -> publica evento en BullMQ
  -> redirecciona

worker
  -> consume eventos de BullMQ
  -> guarda click_events
  -> actualiza url_stats
```

## Stack

- Node.js
- TypeScript
- NestJS
- Next.js
- MongoDB
- Redis
- BullMQ
- Mongoose

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

## Ejecucion

Levantar backend, worker, MongoDB y Redis:

```powershell
npm run docker:up
```

Ver logs:

```powershell
npm run docker:logs
```

Apagar servicios:

```powershell
npm run docker:down
```

Levantar frontend aparte:

```powershell
npm run dev:web
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

## Comandos utiles

```powershell
npm run lint:api
npm run lint:worker
npm --prefix apps/api test -- --runInBand
npm --prefix apps/worker test -- --runInBand
npm --prefix apps/api run build
npm --prefix apps/worker run build
```

## Estado actual

Implementado:

- Creacion de Tiny URLs.
- Persistencia en `short_urls`.
- Estadisticas materializadas en `url_stats`.
- Resolucion con cache Redis.
- Publicacion asincronica de eventos con BullMQ.
- Worker para persistir `click_events` y actualizar `url_stats`.

Pendiente:

- Endpoint publico de estadisticas `GET /api/v1/stats/:code`.
- Frontend minimo para crear Tiny URLs desde navegador.
