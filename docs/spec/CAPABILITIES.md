# CAPABILITIES.md — estado real de cada capacidad

> Plan §1.2: cada capacidad debe tener implementación, prueba, criterio de aceptación y
> **estado explícito**. Nunca presentar como terminado algo que solo está diseñado.

Estados: `PLANNED` · `DESIGNED` · `IMPLEMENTING` · `TESTING` · `VERIFIED` · `PARTIAL` · `BLOCKED` · `DEPRECATED`

## Núcleo

| ID | Capacidad | Estado | Implementación | Prueba | Criterio de aceptación |
|---|---|---|---|---|---|
| CAP-001 | Contratos compartidos | VERIFIED | `packages/schemas` | compilación estricta | Todos los paquetes tipan contra los mismos contratos |
| CAP-002 | Filesystem confinado | VERIFIED | `core/fs.ts` | `unit/core.test.js` | Toda ruta fuera de la raíz lanza excepción |
| CAP-003 | Bus de eventos tipado | VERIFIED | `core/events.ts` | `unit/core.test.js` | Suscripción, emisión y baja funcionan |
| CAP-004 | Logger con sinks | VERIFIED | `core/logger.ts` | uso en runtime | Niveles respetados, silenciable |

## Modelos

| ID | Capacidad | Estado | Implementación | Prueba | Criterio |
|---|---|---|---|---|---|
| CAP-010 | Interfaz `ModelProvider` | VERIFIED | `schemas/model.ts` | `unit/router.test.js` | Todo proveedor la cumple |
| CAP-011 | Proveedor determinista `mock` | VERIFIED | `models/providers/mock.ts` | sí | Mismo input → mismo output, sin red |
| CAP-012 | Adapter OpenAI | IMPLEMENTING | `providers/openai.ts` | sin test con clave real | Streaming SSE y uso de tokens correctos |
| CAP-013 | Adapter Anthropic | IMPLEMENTING | `providers/anthropic.ts` | sin test con clave real | idem |
| CAP-014 | Adapter Google | IMPLEMENTING | `providers/google.ts` | sin test con clave real | idem |
| CAP-015 | Adapter OpenRouter | IMPLEMENTING | `providers/openrouter.ts` | sin test con clave real | idem |
| CAP-016 | Adapter Ollama (local) | IMPLEMENTING | `providers/ollama.ts` | sin test con servidor | Streaming NDJSON correcto |
| CAP-017 | Routing por capacidad | VERIFIED | `router/router.ts` | sí | Elige el proveedor que cubre las capacidades pedidas |
| CAP-018 | Failover + circuit breaker | VERIFIED | `router/` | sí | Con el primero caído, responde el siguiente |
| CAP-019 | Coste y tokens | VERIFIED | `router/router.ts` | sí | `stats()` acumula uso |
| CAP-020 | Cancelación | VERIFIED | `router` + `AbortSignal` | `e2e` | Un signal abortado no reintenta |

## Diseño

| ID | Capacidad | Estado | Implementación | Prueba | Criterio |
|---|---|---|---|---|---|
| CAP-030 | Intent Analyzer | VERIFIED | `design-engine/intent.ts` | sí | Detecta industria, features, acción e idioma |
| CAP-031 | Discovery acotado | VERIFIED | `discovery.ts` | sí | `autonomous`=0 preguntas; el resto documenta asunciones |
| CAP-032 | Direction generator | VERIFIED | `direction.ts` | sí | 3 direcciones coherentes con industria y personalidad |
| CAP-033 | `DESIGN.md` 14 secciones | VERIFIED | `design-md.ts` | sí | Las 14 secciones presentes + tokens CSS |
| CAP-034 | Design tokens → CSS | VERIFIED | `design-systems/tokens.ts` | sí | `findUndeclaredTokens` vacío en el sitio generado |
| CAP-035 | Anti-pattern Engine | VERIFIED | `anti-patterns.ts` | sí | 12 reglas con fix sugerido |
| CAP-036 | Reference Engine | IMPLEMENTING | `references.ts` | parcial | Separa `learnable` de `forbidden`; falta ingesta de imágenes |
| CAP-037 | Content Intelligence | VERIFIED | `content.ts` | sí | Marca placeholders; sin lorem en la salida |
| CAP-038 | Skills desde `SKILL.md` | VERIFIED | `skills/` | sí | Las 13 skills del repo cargan y validan |
| CAP-039 | Catálogo de direcciones | PARTIAL | `design-systems/` | sí | 6 direcciones; objetivo ≥ 20 |

## Código, ejecución, QA

| ID | Capacidad | Estado | Implementación | Prueba | Criterio |
|---|---|---|---|---|---|
| CAP-050 | Generador de sitio | VERIFIED | `code-engine/generator.ts` | `integration` | Pasa QA sin críticos ni altos |
| CAP-051 | Prototype Engine | VERIFIED | `prototype.ts` | `e2e` | Frames mobile y desktop |
| CAP-052 | Sistema de parches | VERIFIED | `patch.ts` | sí | Reporta parches fallidos, no los oculta |
| CAP-053 | Motor de reparación | VERIFIED | `repair.ts` | `integration` | Reduce issues; lo no reparable se reporta |
| CAP-054 | Execution Engine | IMPLEMENTING | `execution/runner.ts` | parcial | Pipeline install/build/test en proyectos con npm |
| CAP-055 | Servidor de preview | VERIFIED | `static-server.ts` | `e2e` | Sirve el sitio y bloquea salir de la raíz |
| CAP-056 | Sandbox | VERIFIED | `sandbox/` | 7 tests | Bloquea binarios, patrones, rutas y secretos |
| CAP-057 | Code QA + Security QA | VERIFIED | `qa/code-qa.ts` | sí | Detecta secretos, eval, http, tabnabbing |
| CAP-058 | Functional QA | VERIFIED | `functional-qa.ts` | sí | Expectativas derivadas del brief |
| CAP-059 | Visual QA estático | VERIFIED | `vision/` | sí | Jerarquía, a11y, contraste WCAG real |
| CAP-060 | Visual QA con navegador | VERIFIED | `vision/browser.ts` | sí | Ejecutado con Chromium real: capturas 1440/768/375, detectó touch targets <44px. Sin Playwright degrada declarándolo |
| CAP-061 | Performance QA | VERIFIED | `qa/performance.ts` | sí | Presupuesto de tamaño, lazy, dimensiones |
| CAP-062 | Regression Engine | VERIFIED | `qa/regression.ts` | sí | Detecta pérdida > 25 % de contenido |
| CAP-063 | Comparación de screenshots | PLANNED | — | — | Diff de píxeles con umbral |
| CAP-064 | Verification Gate | VERIFIED | `verification-gate.ts` | sí | Nunca `Verified` con fallos o desconocidos |
| CAP-065 | Evidence System | VERIFIED | `schemas` + `qa` | sí | Todo issue lleva evidencia |

## Sistema

| ID | Capacidad | Estado | Implementación | Prueba | Criterio |
|---|---|---|---|---|---|
| CAP-070 | Orchestrator / autonomous loop | VERIFIED | `orchestrator.ts` | `e2e` | Brief → entrega sin tareas fallidas |
| CAP-071 | Task system con dependencias | VERIFIED | `agents/brain.ts` | sí | Orden topológico sin ciclos ni bloqueos |
| CAP-072 | Permisos por agente | VERIFIED | `agents/registry.ts` | sí | Fuera de permiso lanza `PermissionDenied` |
| CAP-073 | Bucle de reparación acotado | VERIFIED | `orchestrator.ts` | `e2e` | Nunca supera `maxIterations`; para si no mejora |
| CAP-074 | Memoria en 5 ámbitos | VERIFIED | `memory/` | sí | Recuerda decisiones y preferencias |
| CAP-075 | Artifacts versionados | VERIFIED | `artifacts/store.ts` | sí | Rechaza sobrescribir una versión |
| CAP-076 | Project scan | VERIFIED | `project-engine/scan.ts` | `integration` | Detecta framework, entry points, deps |
| CAP-077 | Project Map | VERIFIED | `map.ts` | `integration` | Grafo con dependientes e importancia |
| CAP-078 | Existing Project Mode completo | PARTIAL | `project-engine` | parcial | Falta modificación segura guiada end-to-end |
| CAP-079 | Git checkpoint / rollback | VERIFIED | `git/git.ts` | manual | Checkpoint antes de entrega |
| CAP-080 | Safe Change System | VERIFIED | `git/changes.ts` | `e2e` | `CHANGES.md` con qué, por qué, riesgo |
| CAP-081 | Telemetría y benchmark | VERIFIED | `telemetry/` | `scripts/benchmark.mjs` | Métricas del plan §66 |
| CAP-082 | CLI | VERIFIED | `apps/cli` | manual + `e2e` | 6 comandos operativos |
| CAP-083 | Daemon HTTP + SSE | VERIFIED | `apps/daemon` | `e2e` | Health, plan, runs, stream y preview |
| CAP-084 | UI del estudio | IMPLEMENTING | `apps/web` | `e2e` (sirve) | Funcional; falta responder question forms |
| CAP-085 | Golden projects + benchmark | VERIFIED | `examples/golden`, `scripts/golden.mjs` | sí | 6 proyectos ejecutan y se comparan |
| CAP-090 | Desktop shell | PLANNED | — | — | FASE 17 |
| CAP-091 | API de plugins | PLANNED | `docs/plugins/` | — | FASE 18 |
| CAP-092 | Marketplace | PLANNED | — | — | FASE 18 |
| CAP-093 | Cloud / colaboración | PLANNED | — | — | FASE 19 |
| CAP-094 | Deploy adapters remotos | PLANNED | `export.ts` declara estado | — | FASE 16 |
| CAP-095 | Multi-model collaboration | PARTIAL | `agents/debate.ts` | sí (debate) | Falta orquestación paralela real |

## Resumen

| Estado | Nº |
|---|---:|
| VERIFIED | 46 |
| IMPLEMENTING | 8 |
| PARTIAL | 5 |
| PLANNED | 6 |

> Recuento verificado el 2026-09-19 tras ejecutar Visual QA con Chromium real.
> CAP-060 pasó de IMPLEMENTING a VERIFIED: capturas reales en tres viewports y
> detección de áreas táctiles menores de 44px que el análisis estático no veía.
