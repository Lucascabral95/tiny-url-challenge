# Worker - Tiny URL Challenge

Worker construido con NestJS. Consume eventos de acceso desde BullMQ, guarda el historial en MongoDB y actualiza las estadisticas materializadas.

## Responsabilidades

- Consumir la cola `click-events`.
- Procesar jobs `tiny-url-clicked`.
- Persistir cada acceso en `click_events`.
- Actualizar `url_stats` con el total de clicks y ultimo click.

## Capas principales

```txt
src/
  infrastructure/
    database/
    queue/
  modules/
    click-events/
      processors/
      repositories/
      schemas/
```

Flujo:

```txt
ClickEventsProcessor
  -> ClickEventsRepository
  -> UrlStatsRepository
```

## Cola

Queue:

```txt
click-events
```

Job:

```txt
tiny-url-clicked
```

Payload esperado:

```ts
{
  code: string;
  clickedAt: string;
  ip?: string;
  userAgent?: string;
}
```

## Persistencia

Por cada evento:

- Inserta un documento en `click_events`.
- Actualiza `url_stats` con `$inc` para `totalClicks`.
- Actualiza `lastClick` con la fecha del evento.
- Usa `upsert` para tolerar que falte el documento de stats.

Si MongoDB falla, el job falla y BullMQ puede reintentarlo segun la configuracion del productor.

## Comandos

Desde la raiz:

```powershell
npm run lint:worker
npm --prefix apps/worker test -- --runInBand
npm --prefix apps/worker run build
```
