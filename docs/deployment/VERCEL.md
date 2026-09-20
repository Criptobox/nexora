# Desplegar NEXORA en Vercel

## Por qué falla la configuración por defecto

Vercel detecta un proyecto Node, ejecuta `npm run build` y luego busca un directorio
estático que servir. `npm run build` de NEXORA es `tsc -b`: compila TypeScript a
`dist/`, no produce ningún sitio. De ahí el error:

```
Error: No Output Directory named "public" found after the Build completed
```

El build **no falló** — simplemente no había nada que publicar.

## Qué se despliega realmente

NEXORA es un daemon con estado (HTTP + SSE) más un CLI. Eso no encaja tal cual en un
hosting serverless, así que el despliegue usa una forma adaptada:

| | Local (`npm run daemon`) | Vercel (serverless) |
|---|---|---|
| UI | `apps/web/public` servida por el daemon | `public/` estático en el CDN |
| Progreso | SSE en vivo, fase a fase | Una sola respuesta al terminar |
| Preview | `/preview/:id/*` desde disco | HTML autocontenido vía `srcdoc` |
| Salida | `examples/output/<runId>` | `/tmp` (efímero, se descarta) |
| Proceso | Persistente | Función de 60 s máx. |

La UI detecta el entorno con `window.NEXORA_DEPLOY` (lo inyecta `scripts/build-web.mjs`)
y elige la ruta adecuada. El mismo `app.js` sirve para los dos.

## Archivos relevantes

- `vercel.json` — `buildCommand: npm run build:web`, `outputDirectory: public`, e
  `includeFiles` para que las funciones lleven `packages/*/dist`, `skills/` y
  `design-systems/`.
- `scripts/build-web.mjs` — compila y copia `apps/web/public` → `public/`.
- `api/health.mjs` — estado del runtime.
- `api/runs.mjs` — ejecuta el loop completo y devuelve el sitio ya generado.

## Desplegar

```bash
npm i -g vercel
vercel --prod
```

No hacen falta variables de entorno: el proveedor `mock` es determinista y funciona sin
claves. Para usar modelos reales, añade `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc. en
*Settings → Environment Variables*.

## Limitaciones

1. **Sin streaming.** La petición tarda lo que tarde el run entero. Con `mock` son
   milisegundos; con un modelo real puede acercarse al límite de 60 s.
2. **Salida efímera.** Cada invocación escribe en `/tmp` y se descarta. No hay memoria
   de proyecto, ni artifacts versionados, ni checkpoints de git entre runs.
3. **Sin Visual QA con navegador.** Playwright no está en el bundle; el gate marcará
   `No critical console errors` como `unknown`, igual que en local sin Playwright.
4. **Sin sandbox de comandos.** El runner de procesos no aplica en serverless.

Para el producto completo —memoria, artifacts, checkpoints, QA visual— usa el daemon
local o un contenedor persistente. Ver `docs/deployment/README.md`.
