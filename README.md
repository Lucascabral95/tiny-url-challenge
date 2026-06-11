# Tiny URL Challenge

Monorepo inicial para el challenge de Tiny URL.

Estado actual:
- `apps/api`: backend con NestJS
- `apps/worker`: worker con NestJS
- `apps/web`: frontend mínimo con Next.js
- validación básica de variables de entorno en `api` y `worker`
- scripts raíz para desarrollo, build y lint

## Stack

- Node.js
- TypeScript
- NestJS
- Next.js
- MongoDB
- Redis

## Estructura

```txt
apps/
  api/
  worker/
  web/
```

## Variables de entorno

El proyecto usa un único `.env` en la raíz.

Variables actuales:

```env
API_PORT=3000
WEB_PORT=3001
MONGO_URI=mongodb://mongo:27017/tiny-url
REDIS_HOST=redis
REDIS_PORT=6379
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Instalación

Instalar dependencias por app:

```powershell
cd apps/api
npm install

cd ../worker
npm install

cd ../web
npm install
```

## Scripts

Desde la raíz del proyecto:

```powershell
npm run dev:api
npm run dev:worker
npm run dev:web
```

```powershell
npm run build:api
npm run build:worker
npm run build:web
```

```powershell
npm run lint:api
npm run lint:worker
npm run lint:web
```

## Próximo paso

Pendiente de implementación:
- persistencia en MongoDB
- caché con Redis
- cola de mensajes
- endpoints de Tiny URL y estadísticas
- `docker-compose.yml`
