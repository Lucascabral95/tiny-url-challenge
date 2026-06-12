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

GET /api/v1/stats/:code
  -> lee url_stats
  -> devuelve totalClicks y lastClick
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
- Endpoint de estadisticas `GET /api/v1/stats/:code`.

Pendiente:

- Frontend minimo para crear Tiny URLs desde navegador.
