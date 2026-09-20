# ADR-008 — Cero dependencias de runtime

**Estado:** Accepted · 2026-09-19

## Context

El plan advierte sobre dependencias maliciosas (§33) y exige auditar licencia y procedencia
de todo lo que se reutiliza (§76). Además, ADR-001 exige arranque offline y ADR-002 exige
que el loop sea testeable en CI. Cada dependencia añade superficie de ataque, riesgo de
instalación y una licencia que auditar.

## Decision

El motor completo (19 paquetes, 4 apps) usa **solo la librería estándar de Node.js ≥ 20**:

- HTTP, SSE y servidor estático: `node:http`.
- Cliente de modelos: `fetch` nativo y `AbortSignal.timeout`.
- Ejecución: `node:child_process` sin shell.
- Filesystem, crypto, path: nativos.
- Tests: `node:test` + `node:assert`.
- Lint y formato: scripts propios en `scripts/`.

Dependencias permitidas:
- **devDependencies:** `typescript`, `@types/node`.
- **Opcionales, no instaladas:** `playwright` (Visual QA real).

Añadir una dependencia de runtime requiere un ADR que justifique por qué la stdlib no basta.

## Alternatives

1. **Stack habitual (express, zod, chalk, commander, better-sqlite3…)** — desarrollo más rápido, pero cientos de paquetes transitivos, licencias que auditar y riesgo de supply chain en un producto que además ejecuta código generado.
2. **Dependencias mínimas y auditadas (2-3)** — razonable; se rechaza por ahora porque la stdlib de Node 20 cubre todos los casos sin coste.

## Consequences

**Positivas**
- `npm install` instala 25 paquetes (solo tooling de build), en segundos.
- Superficie de ataque mínima en un sistema que ejecuta código generado por IA.
- `LICENSE-MATRIX.md` cabe en una tabla.
- El repositorio no envejece con el ecosistema.

**Negativas**
- Más código propio: validación, parseo de SKILL.md, lint, servidor HTTP, cliente SSE.
- Sin el ergonomics de librerías maduras (p. ej. `zod` para validación de esquemas).
- La UI es nativa en vez de React, lo que limita su complejidad (aceptado en v0.1; ver ARCHITECTURE-OPTIONS §5).

**Revisión:** al migrar la UI a React + Vite + Monaco, esas dependencias serán de la app web,
no del motor. El motor debe seguir con cero.
