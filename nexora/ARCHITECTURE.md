# ARCHITECTURE.md

## 1. Vista general

```
                         NEXORA
                            │
                    ┌───────┴────────┐
                    │                │
                USER UI          PROJECT UI
                    │                │
                    └───────┬────────┘
                            │
                     ORCHESTRATOR
                            │
             ┌──────────────┼──────────────┐
             │              │              │
           BRAIN          MEMORY        CONTEXT
             │              │              │
             └──────────────┼──────────────┘
                            │
                     DESIGN ENGINE
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          SKILLS       DESIGN SYSTEMS   REFERENCES
             │              │              │
             └──────────────┼──────────────┘
                            │
                     PROTOTYPE ENGINE
                            │
                         VISION
                            │
                     CODE ENGINE
                            │
                     EXECUTION ENGINE
                            │
                       SANDBOX
                            │
                     QA / VERIFICATION
                            │
                    DEPLOY / EXPORT / GIT
```

## 2. Mapa paquete → responsabilidad

| Paquete | Responsabilidad | Depende de |
|---|---|---|
| `schemas` | Contratos: `Task`, `AgentResult`, `Artifact`, `Issue`, `ModelProvider`, `DesignSystem`, `ProjectMap` | — |
| `core` | `ScopedFs`, `EventBus`, logger, `Result`, config, ids, semver, errores tipados | `schemas` |
| `telemetry` | Métricas y registro de benchmark | `core` |
| `models` | Adapters de proveedor (`mock`, OpenAI, Anthropic, Google, OpenRouter, Ollama) + `collect` | `core`, `schemas` |
| `router` | Selección por capacidad, retries, timeout, circuit breaker, failover, coste | `models` |
| `memory` | Memoria corta/proyecto/diseño/técnica/QA/preferencias sobre JSONL | `core` |
| `artifacts` | Artifacts versionados sin sobrescritura + parser artifact-first | `core`, `schemas` |
| `skills` | `SKILL.md` → objeto tipado, validación, registro, selección por brief | `core` |
| `design-systems` | Tokens, catálogo de direcciones, detección de deriva de tokens | `core` |
| `design-engine` | Intent, discovery, direcciones, `DESIGN.md`, anti-patterns, referencias, contenido | `skills`, `design-systems` |
| `project-engine` | Manifest, scan de proyecto existente, Project Map | `core`, `artifacts` |
| `code-engine` | Generador de sitio, prototipo, parches, reparación, export | `design-engine` |
| `sandbox` | Policy, allowlist, patrones prohibidos, saneado de entorno, ejecución sin shell | `core` |
| `execution` | install/build/test/lint/typecheck + servidor estático de preview | `sandbox` |
| `vision` | DOM estático, contraste WCAG, Browser Agent (Playwright opcional), análisis visual | `execution` |
| `qa` | Code QA, functional QA, performance, regresión, verification gate, pipeline | `vision`, `design-engine` |
| `git` | Checkpoint, commit, rollback + Safe Change System | `sandbox` |
| `agents` | Brain/planner, designer, coder, critic, qa, researcher, debate, permisos | casi todos |
| `orchestrator` | Autonomous loop, bootstrap del runtime, informe | todos |

Las dependencias son un DAG estricto verificado por TypeScript project references: no hay ciclos.

## 3. Flujo de datos de un run

```
brief
  │  analyzeIntent()            → Intent {industry, features, primaryAction, unknowns}
  │  planDiscovery(autonomy)    → preguntas (solo alto impacto) + asunciones → memoria
  │  planProject()              → 12 tareas con dependencias → orderTasks() topológico
  ▼
designer  → generateDirections() → chooseDirection() → buildDesignSystem() → DESIGN.md + tokens
  ▼
designer  → generatePrototype()  → frames mobile/desktop
  ▼
critic    → analyzeVisual + detectAntiPatterns sobre el prototipo (gate previo al código)
  ▼
coder     → generateSite()       → index.html, styles.css, app.js, tokens.json
  ▼
execution → escritura en site/ + serveStatic() (preview)
  ▼
qa        → runQaPipeline() → codeQa + antiPatterns + functionalQa + performanceQa
                             + analyzeVisual (+ BrowserAgent si hay Playwright) + regresión
  ▼
loop de reparación (máx N, se detiene si no mejora)
     coder.repair() → reescritura → qa de nuevo
  ▼
verificationGate() → Verified | Partially verified | Not verified
  ▼
artifact versionado + checkpoint git + REPORT.md
```

## 4. Decisiones estructurales

- **Cero dependencias en runtime.** Todo el motor usa solo la librería estándar de Node. Playwright es opcional y degradado explícito. Menos superficie de ataque, arranque garantizado, y `npm install` no puede romper una demo. Ver ADR-008.
- **Generador determinista como suelo.** El Code Engine siempre puede producir un sitio válido sin modelo. Cuando hay proveedor real, el agente mejora ese suelo. Esto hace el sistema testeable de extremo a extremo (ADR-002).
- **Estado en `state` del contexto del agente**, no en variables globales: cada run es aislado y cancelable.
- **`.nexora/` separado** de los archivos del usuario en todo momento (plan §59).
- **Bucles acotados por construcción**: `maxIterations` y detención si no mejora; `orderTasks` no puede quedarse colgado con dependencias rotas.

## 5. Extender el sistema

| Quiero… | Toco… |
|---|---|
| Añadir un proveedor de modelo | `packages/models/src/providers/` + registrarlo en `bootstrap.ts` |
| Añadir una skill | `skills/<categoría>/<id>/SKILL.md` (se carga sola) |
| Añadir una dirección visual | `design-systems/<id>.json` |
| Añadir una regla de anti-pattern | `packages/design-engine/src/anti-patterns.ts` |
| Añadir una comprobación de QA | `packages/qa/src/*.ts` + engancharla en `pipeline.ts` |
| Añadir una reparación automática | `packages/code-engine/src/repair.ts` |
| Añadir un agente | implementar `Agent` y registrarlo en `bootstrap.ts` |
