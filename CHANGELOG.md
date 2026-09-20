# CHANGELOG

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) · Versionado: [SemVer](https://semver.org/lang/es/).

`0.x` = experimental · `1.0` = MVP estable · `1.x` = evolución compatible · `2.x` = cambios arquitectónicos mayores.

## [0.1.3] — 2026-09-20

### Corregido

- **Build irrecuperable sin `dist/`.** Si los `.tsbuildinfo` sobrevivían pero los
  `dist/` no (copia del repo, backup parcial, empaquetado que excluye `dist/` pero no
  `*.tsbuildinfo`), `tsc -b` daba por compilado todo y no emitía nada: decenas de
  `Cannot find module '@nexora/core'`. `npm run clean` ya no depende de
  `tsc -b --clean` —que necesita los `dist/` para saber qué borrar y por tanto no puede
  salir de ese estado— sino que borra `dist/` y `.tsbuildinfo` explícitamente. Añadido
  `npm run rebuild` y documentado en `docs/troubleshooting/`.
- **`commit failed` espurio en el segundo checkpoint.** `git commit` sale con código 1
  cuando no hay nada que confirmar, y eso se registraba como fallo devolviendo `null`.
  Sin cambios el árbol ya está en el estado deseado: ahora se devuelve el HEAD actual.
  Cubierto por `tests/unit/git-identity.test.js`.

## [0.1.2] — 2026-09-20

### Corregido

- **Checkpoints de git silenciosamente rotos.** `GitEngine.init()` salía antes si el
  directorio ya era un repo, sin configurar la identidad local. En una máquina sin
  `git config` global, `checkpoint('delivery')` fallaba con "Author identity unknown",
  devolvía `null` y el run continuaba **sin punto de restauración**. Ahora la identidad
  se garantiza siempre, y nunca se pisa la que el usuario ya tenga configurada.
  Cubierto por `tests/unit/git-identity.test.js`.
- **Versión desincronizada.** La UI mostraba `v0.1.0` con el paquete ya en `0.1.1`:
  `core/version.ts` duplica el número de `package.json`. Sincronizados y protegidos por
  `tests/unit/version-sync.test.js` para que no vuelvan a divergir.

## [0.1.1] — 2026-09-19

### Verificación con navegador real

- Visual QA ejecutado con Playwright/Chromium instalado: capturas en desktop (1440),
  tablet (768) y mobile (375) generadas y observadas. Detectó áreas táctiles < 44px que
  el análisis estático no veía; reparadas automáticamente por el loop.
- Estudio web verificado end-to-end en navegador: el loop completo corre, el preview se
  carga y el gate se muestra. 0 errores de consola.

### Corregido

- **Evento `done` duplicado en el daemon.** El `done` interno del orchestrator (sin
  informe) colisionaba con el evento terminal del run, de modo que la UI cerraba el
  stream SSE antes de recibir el informe y el preview nunca aparecía. El interno se
  reenvía ahora como `phase-done`, y la UI ignora cualquier `done` sin gate.
- **Contenido contaminado entre nichos.** Una cafetería recibía el copy de una
  hamburguesería ("carne madurada", "pan brioche", "pedí por WhatsApp"). Añadido
  `sectionContent()` en `design-engine`: menú, razones y testimonios siguen al nicho
  detectado (café, pizzería, sushi, panadería, hamburguesería) con un genérico honesto
  como fallback. Cubierto por `tests/unit/content-coherence.test.js`.
- **Nombre del proyecto.** Perdía acentos ("Hamburgueseria") por pasar por `slugify`, y
  arrastraba las features ("Cafetería de Especialidad Con Menú y Res"). Ahora conserva
  acentos, corta en la preposición que introduce la lista y limita a 5 palabras.
- **Hero.** El glow de fondo se recortaba como un bloque rectangular visible; ahora es
  radial y contenido. El placeholder de imagen tiene textura en lugar de un bloque plano.

## [0.1.0] — 2026-09-19

Primera versión ejecutable: el loop central completo, de brief a entrega verificada.

### Añadido

**Fundación**
- Monorepo con 19 paquetes y 4 apps, TypeScript estricto con project references (DAG sin ciclos).
- `schemas` con los contratos del plan §60: `Task`, `AgentResult`, `Artifact`, `Issue`, `ModelProvider`, `DesignSystem`, `ProjectMap`.
- `core`: `ScopedFs` con bloqueo de path traversal, `EventBus` tipado, logger con sinks, `Result`, semver, config.

**Modelos y routing**
- Interfaz `ModelProvider` + adapters: `mock` (determinista, offline), OpenAI, Anthropic, Google, OpenRouter, Ollama.
- `ModelRouter`: selección por capacidad, retries, timeout, circuit breaker, failover, seguimiento de coste y tokens, cancelación.

**Diseño**
- Intent Analyzer, Discovery Planner con presupuesto de preguntas por modo de autonomía.
- Catálogo de 6 direcciones visuales como datos consultables.
- Generador de `DESIGN.md` (14 secciones) y design tokens que alimentan el CSS.
- Anti-pattern Engine con 12 reglas; Reference Engine que separa REFERENCE de COPY; Content Intelligence.

**Código y ejecución**
- Generador determinista de sitio (HTML/CSS/JS sin dependencias, 100 % dirigido por tokens).
- Prototype Engine con frames mobile/desktop.
- Sistema de parches con reporte de fallos; motor de reparación con 11 correcciones automáticas verificables.
- `ExecutionEngine` (install/typecheck/lint/test/build) y servidor estático de preview.
- Sandbox: allowlist de binarios, patrones prohibidos, sin shell, timeouts, saneado de entorno y redacción de secretos.

**Visión y QA**
- Análisis estático de DOM, contraste WCAG real, Browser Agent con Playwright **opcional** y degradación explícita.
- Pipeline de QA: código, seguridad, anti-patterns, funcional, performance, visual, accesibilidad y regresión.
- Verification Gate con lenguaje `Verified` / `Partially verified` / `Not verified`.

**Sistema**
- Memoria en cinco ámbitos con extracción de preferencias en lenguaje natural.
- Artifacts versionados sin sobrescritura silenciosa.
- Project Engine: manifest, scan de proyecto existente y Project Map con grafo de dependencias e importancia.
- Git Engine con checkpoint/rollback y Safe Change System.
- Orchestrator con autonomous loop y bucle de reparación acotado.
- CLI (`create`, `plan`, `scan`, `preview`, `doctor`), daemon HTTP+SSE y UI del estudio.

**Calidad**
- 58 tests: 51 unit/integración + 7 E2E.
- CI con typecheck, lint, tests, E2E, auditoría de seguridad y golden projects.
- Research pack completo, 8 ADRs, documentación por subsistema.

### Conocido / no incluido
- Desktop, marketplace, cloud y deploy adapters remotos: `PLANNED` (ver `docs/spec/CAPABILITIES.md`).
- Persistencia en SQLite: pendiente (hoy JSONL, ver ADR-007).
- UI en React + Vite + Monaco: pendiente (hoy nativa, ver ADR-008).
