# ADR-006 — Vision QA: navegador opcional con degradación explícita

**Estado:** Accepted · 2026-09-19

## Context

Plan §24-§25 y §38: NEXORA debe observar screenshot, DOM, estilos computados, consola, red,
viewport y árbol de accesibilidad. Eso requiere un navegador real (Playwright, ~300 MB con
Chromium). Pero ADR-001 exige que NEXORA funcione siempre, y §63 prohíbe afirmar que se
verificó algo que no se verificó.

## Decision

Dos niveles de observación, con la diferencia **siempre declarada**:

1. **Siempre activo — análisis estático:** parseo de DOM, jerarquía de encabezados,
   landmarks, alt, nombres accesibles, meta viewport, media queries y **contraste WCAG
   calculado de verdad** sobre los tokens del design system.

2. **Si Playwright está instalado — observación real:** screenshots en 375/768/1440,
   errores de consola, peticiones fallidas, overflow horizontal y tamaño de áreas táctiles.

`BrowserAgent.observe()` devuelve `available: false` con `reason` cuando Playwright no está.
El informe escribe literalmente *"Observación con navegador real: no — QA estático"*, y el
Verification Gate marca "No critical console errors" como `unknown`, nunca como `pass`.

## Alternatives

1. **Playwright obligatorio** — QA completo siempre, pero rompe local-first y encarece CI.
2. **Solo estático** — nunca detectaría overflow real ni errores de runtime.
3. **jsdom** — aproximación intermedia, pero no calcula layout real: daría falsa confianza, que es peor que no mirar.

## Consequences

**Positivas**
- El sistema nunca miente sobre el nivel de verificación alcanzado.
- Instalación ligera por defecto; QA completo a un `npm i -D playwright` de distancia.
- El análisis estático ya detecta la mayoría de fallos de accesibilidad y estructura.

**Negativas**
- Dos caminos de código que mantener.
- Sin Playwright, el gate casi nunca llega a `Verified` — **esto es intencional**.
