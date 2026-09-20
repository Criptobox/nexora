# @nexora/web

UI del estudio NEXORA. En v0.1 es HTML/CSS/JS nativo servido por el daemon —
sin bundler y sin dependencias externas, de forma que la interfaz arranca
siempre aunque no haya red (local-first, ADR-001).

La migración a React + Vite + Monaco está declarada en el plan (§9) y se hará
cuando el loop central esté `VERIFIED`; hacerlo antes solo añadiría deuda.

Arranque:

```bash
npm run build && npm run daemon    # desde la raíz del repo
# http://localhost:7788
```
