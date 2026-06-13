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

## Decisiones de diseno

- El worker concentra el procesamiento asincronico para que la API mantenga baja latencia al redireccionar.
- `click_events` conserva el historial auditable de accesos.
- `url_stats` se actualiza como vista materializada para responder estadisticas sin agregaciones costosas.
- Si MongoDB falla, el job falla y BullMQ puede reintentarlo; no se descarta silenciosamente el evento.

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
npm run test:worker
npm run build:worker
```
