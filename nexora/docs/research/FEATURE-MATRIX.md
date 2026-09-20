# FEATURE-MATRIX.md

Clasificación de cada capacidad: `KEEP` · `ADAPT` · `REBUILD` · `INSPIRE` · `REJECT` · `NEW`.
La columna **Estado** refleja lo implementado hoy, verificable en el código y los tests.

## Del plan maestro (§6)

| Capacidad | Origen | Decisión | Estado | Dónde |
|---|---|---|---|---|
| OpenDesign Skills | OpenDesign | **ADAPT** | VERIFIED | `packages/skills`, `skills/*/SKILL.md` |
| OpenDesign `DESIGN.md` | OpenDesign | **ADAPT + EXTEND** | VERIFIED | `design-engine/design-md.ts` — 14 secciones + tokens |
| FORJA Project Map | FORJA | **REBUILD** | VERIFIED | `project-engine/map.ts` — grafo con importancia y design_role |
| FORJA Visual QA | FORJA | **REBUILD** | VERIFIED | `vision/` + `qa/` — issues con evidencia obligatoria |
| 1.486 design systems | Design Intelligence | **INSPIRE + BUILD OWN PIPELINE** | PARTIAL | `design-systems/` — catálogo propio de 6, ampliable |
| Model Router | FORJA | **REBUILD** | VERIFIED | `router/` — capacidades, breaker, failover, coste |
| Sandbox | FORJA | **REBUILD** | VERIFIED | `sandbox/` — allowlist, sin shell, secretos saneados |
| Artifact parser | OpenDesign | **INSPIRE** | VERIFIED | `artifacts/parser.ts` |

## Capacidades completas

### Diseño

| Capacidad | Decisión | Estado | Evidencia |
|---|---|---|---|
| Intent Analyzer | NEW | VERIFIED | `tests/unit/design-engine.test.js` |
| Discovery con presupuesto de preguntas | ADAPT | VERIFIED | idem |
| Question form | ADAPT | PARTIAL | emitido por evento; UI muestra, aún no recoge respuestas interactivas |
| Direction generator (3 opciones + "decídelo tú") | ADAPT | VERIFIED | `direction.ts` |
| `DESIGN.md` de 14 secciones | ADAPT + EXTEND | VERIFIED | test dedicado |
| Design tokens → CSS | NEW | VERIFIED | `tokensToCss`, `findUndeclaredTokens` |
| Anti-pattern Engine (12 reglas) | NEW | VERIFIED | `anti-patterns.ts` |
| Reference Engine (REFERENCE vs COPY) | NEW | IMPLEMENTING | `references.ts`; falta ingesta de screenshots |
| Content Intelligence | NEW | VERIFIED | `content.ts` |
| Design memory / evolución | NEW | VERIFIED | `memory` + extracción de preferencias |

### Modelos

| Capacidad | Decisión | Estado |
|---|---|---|
| Interfaz `ModelProvider` | REBUILD | VERIFIED |
| Adapters OpenAI / Anthropic / Google / OpenRouter / Ollama | NEW | IMPLEMENTING (sin claves no se prueban en CI) |
| Proveedor determinista `mock` | NEW | VERIFIED |
| Routing por capacidad | REBUILD | VERIFIED |
| Failover + circuit breaker + timeout + cancelación | REBUILD | VERIFIED |
| Seguimiento de coste y tokens | NEW | VERIFIED |
| Multi-model collaboration | NEW | PARTIAL (roles definidos; orquestación paralela pendiente) |
| Debate controlado | NEW | VERIFIED |

### Código y ejecución

| Capacidad | Decisión | Estado |
|---|---|---|
| Generador de sitio dirigido por tokens | NEW | VERIFIED |
| Prototype Engine | ADAPT | VERIFIED |
| Sistema de parches con reporte de fallos | NEW | VERIFIED |
| Motor de reparación (11 correcciones) | REBUILD | VERIFIED |
| Execution Engine (install/build/test/lint) | REBUILD | IMPLEMENTING (probado en estático) |
| Servidor de preview | NEW | VERIFIED |
| Export a directorio / ZIP | KEEP | VERIFIED |
| Deploy a Vercel / Netlify / Cloudflare / Pages | NEW | **PLANNED** |

### QA

| Capacidad | Decisión | Estado |
|---|---|---|
| Code QA + Security QA | NEW | VERIFIED |
| Functional QA derivado del brief | NEW | VERIFIED |
| Visual QA estático (DOM + contraste WCAG) | REBUILD | VERIFIED |
| Visual QA con navegador (screenshot, consola, overflow) | REBUILD | IMPLEMENTING (requiere Playwright; degrada explícitamente) |
| Accessibility QA | NEW | VERIFIED |
| Performance QA (presupuesto estático) | NEW | VERIFIED |
| Regression Engine | REBUILD | VERIFIED (firma estructural; comparación de píxeles PLANNED) |
| Verification Gate | NEW | VERIFIED |
| Evidence System | NEW | VERIFIED |

### Sistema

| Capacidad | Decisión | Estado |
|---|---|---|
| Orchestrator + autonomous loop | REBUILD | VERIFIED |
| Task system con dependencias | NEW | VERIFIED |
| Permisos por agente | NEW | VERIFIED |
| Memoria en 5 ámbitos | REBUILD | VERIFIED |
| Artifacts versionados | ADAPT | VERIFIED |
| Project scan + Project Map | REBUILD | VERIFIED |
| Existing Project Mode completo | REBUILD | PARTIAL (scan y mapa sí; modificación segura guiada pendiente) |
| Git checkpoint / rollback | REBUILD | VERIFIED |
| Safe Change System | NEW | VERIFIED |
| Telemetría y benchmark | NEW | VERIFIED |
| CLI | NEW | VERIFIED |
| Daemon HTTP + SSE | REBUILD | VERIFIED |
| UI del estudio | REBUILD | IMPLEMENTING (nativa; React+Monaco PLANNED) |
| Desktop | ADAPT | **PLANNED** |
| Plugins | NEW | **PLANNED** (API declarada en `docs/plugins/`) |
| Marketplace | NEW | **PLANNED** |
| Cloud | NEW | **PLANNED** |

## Rechazado explícitamente

| Idea | Por qué |
|---|---|
| Fork de OpenDesign renombrado | Produce un fork, no un producto (plan §3.2) |
| Importar el dataset de 1.486 sistemas tal cual | Procedencia y licencia sin verificar; homogeneiza el resultado |
| Puntuación estética única como criterio automático | El gusto no es una métrica; se usan scores internos por categoría (plan §66) |
| Empezar por el desktop | El plan lo prohíbe hasta que web/local sea estable (FASE 17) |
| Decenas de proveedores en el MVP | Primero pocos y bien (FASE 3) |
| Mostrar cadenas internas de razonamiento | Plan §46 |
| Cuentas y billing en el MVP | Plan §69 |
