# Web - Tiny URL Challenge

Frontend Next.js para probar el flujo principal del challenge desde el navegador.

## Responsabilidad

La aplicacion permite:

- Crear una Tiny URL con URL original y alias opcional.
- Copiar y abrir la Tiny URL generada.
- Consultar estadisticas por codigo.
- Ver el estado basico de la API con `GET /health`.

## Stack

- Next.js
- React
- TypeScript
- Sass Modules
- React Hook Form
- Zod
- Sonner
- Lucide React

## Ejecucion

Desde la raiz del monorepo:

```powershell
npm run dev:web
```

El frontend levanta en:

```txt
http://localhost:3001
```

La API esperada es:

```txt
http://localhost:3000
```

Por defecto el frontend usa `NEXT_PUBLIC_API_URL` si existe. Si no existe, usa `http://localhost:3000`.

## Endpoints usados

```txt
GET /health
POST /api/v1/urls
GET /api/v1/stats/:code
GET /:code
```

## Estructura

```txt
app/
  layout.tsx
  page.tsx
  globals.scss
components/
  api-status/
  result-card/
  stats-panel/
  tiny-url-console/
  ui/
  url-form/
lib/
  api.ts
  types.ts
  validations.ts
```

## Calidad

```powershell
npm run lint
npm run build
```
