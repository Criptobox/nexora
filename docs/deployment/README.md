# Deployment

## Estado real de cada adapter

| Adapter | Estado | Requiere |
|---|---|---|
| `zip` | ✅ VERIFIED | — |
| `local-dir` | ✅ VERIFIED | — |
| `git` | ✅ VERIFIED | `git` |
| `vercel` | ⬜ PLANNED | `VERCEL_TOKEN` |
| `netlify` | ⬜ PLANNED | `NETLIFY_TOKEN` |
| `cloudflare-pages` | ⬜ PLANNED | `CF_API_TOKEN` |
| `github-pages` | ⬜ PLANNED | `GITHUB_TOKEN` |

`DEPLOY_ADAPTERS` en `packages/code-engine/src/export.ts` expone estos estados en tiempo de
ejecución: el sistema **sabe** lo que no puede hacer y lo dice.

## Lo que funciona hoy

```bash
# El sitio ya está en <out>/site/ — cualquier hosting estático sirve
cd mi-sitio/site && zip -r ../sitio.zip .

# Git con checkpoint automático ya creado por el orchestrator
cd mi-sitio/site && git log --oneline
```

## Desplegar a mano

El sitio generado es HTML/CSS/JS estático sin build: arrástralo a Netlify Drop, súbelo a
cualquier hosting o sírvelo con `npx serve`.

## Vercel

El despliegue serverless tiene su propia guía, con las limitaciones que impone:
[`VERCEL.md`](./VERCEL.md).
