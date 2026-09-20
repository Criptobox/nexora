# NEXORA

> **AI Web Creation Engine** — de una idea a diseño, código, ejecución y QA visual/funcional.

NEXORA no es un chatbot que escribe HTML, ni un generador de landings, ni un wrapper de un
modelo. Es un **motor que dirige el proceso completo** de creación web: interpreta la
intención, decide una dirección visual, construye un Design System, genera código, lo
ejecuta, lo observa, detecta problemas, los corrige y **solo declara terminado lo que ha
podido verificar**.

> **Regla central:** NEXORA controla el proceso; los modelos son componentes intercambiables del proceso.

[![estado](https://img.shields.io/badge/estado-v0.1%20MVP-blue)]() [![tests](https://img.shields.io/badge/tests-58%20passing-brightgreen)]() [![licencia](https://img.shields.io/badge/licencia-Apache--2.0-lightgrey)]()

---

## Arranque rápido

Requisitos: **Node.js ≥ 20.10**. No hace falta ninguna API key para la demo: el
proveedor `mock` es determinista y offline (local-first, [ADR-001](docs/architecture/ADR/ADR-001-local-first.md)).

```bash
npm install
npm run build
npm test                 # 58 tests: unit + integración + E2E

# La demo del plan §81, de principio a fin:
npm run demo

# O directamente con el CLI:
node apps/cli/dist/index.js create "Crea una web premium para una hamburguesería frente al mar, juvenil pero elegante, con menú y pedidos por WhatsApp" --out ./salida --autonomous
```

Salida generada:

```
salida/
├── site/           sitio ejecutable (abrir site/index.html)
├── prototype/      prototipo de dirección visual
├── DESIGN.md       Design System del proyecto
├── tokens.json     design tokens
├── PROJECT.md      brief, intención detectada, estructura
├── REPORT.md       informe de QA con estado de verificación y evidencia
└── .nexora/        memoria, artifacts versionados, baselines, changelog
```

### El estudio (UI)

```bash
npm run daemon      # http://localhost:7788
```

Interfaz de tres paneles: proyecto y actividad del agente a la izquierda, live canvas con
selector de viewport en el centro, issues y estado de verificación a la derecha.

---

## Qué hace, exactamente

El **Autonomous Loop** (`packages/orchestrator`) ejecuta este flujo, no `PROMPT → HTML → DONE`:

```
BRIEF → DISCOVERY → DESIGN DIRECTION → DESIGN SYSTEM → PROTOTYPE → VISUAL REVIEW
      → IMPLEMENTATION → EXECUTION → VISUAL QA → FUNCTIONAL QA → REGRESSION → DELIVERY
```

| Paso | Qué ocurre de verdad | Paquete |
|---|---|---|
| Discovery | Analiza intención (industria, acción, personalidad, features) y **solo pregunta lo que cambia el resultado** | `design-engine` |
| Design direction | Propone 3 direcciones de un catálogo consultable; el usuario elige o delega | `design-systems` |
| Design system | Genera `DESIGN.md` de 14 secciones + tokens que alimentan el CSS | `design-engine` |
| Prototype | Frames mobile/desktop para validar dirección antes de invertir en código | `code-engine` |
| Visual review | Auto-crítica del prototipo contra `DESIGN.md` | `agents/critic` |
| Implementation | Código HTML/CSS/JS sin dependencias, 100 % dirigido por tokens | `code-engine` |
| Execution | Escritura y servidor de preview, siempre en sandbox | `execution`, `sandbox` |
| Visual QA | DOM, contraste WCAG real, jerarquía, anti-patterns; con Playwright añade screenshot, consola y overflow reales | `vision`, `qa` |
| Functional QA | Expectativas derivadas del brief (¿hay menú con precios? ¿el WhatsApp funciona?) | `qa` |
| Repair | Parches deterministas y verificables; lo que no se puede arreglar con certeza se **reporta**, no se finge | `code-engine` |
| Regression | Firma estructural contra baseline; detecta pérdida de contenido | `qa` |
| Delivery | Verification Gate + informe con evidencia | `qa`, `orchestrator` |

---

## Principios que el código respeta

1. **No inventar capacidades.** Cada capacidad tiene estado explícito en [`docs/spec/CAPABILITIES.md`](docs/spec/CAPABILITIES.md): `PLANNED`, `IMPLEMENTING`, `VERIFIED`, `PARTIAL`…
2. **No false completion.** El [Verification Gate](packages/qa/src/verification-gate.ts) distingue `Verified` / `Partially verified` / `Not verified`. Si Playwright no está instalado, el informe dice *"QA estático"*; nunca afirma haber visto el navegador.
3. **El modelo no es la aplicación.** Interfaz `ModelProvider` común, router por capacidades, failover con circuit breaker y adapters para OpenAI, Anthropic, Google, OpenRouter, Ollama y `mock`.
4. **Ningún modelo tiene permisos ilimitados.** Sandbox con allowlist de binarios, bloqueo de patrones destructivos, confinamiento de rutas, timeouts y saneado de secretos.
5. **Evidencia en cada afirmación.** Todo issue lleva categoría, severidad, ubicación, fix sugerido y evidencia (archivo, métrica, screenshot u observación de navegador).
6. **Local-first.** Sin cuenta, sin nube y sin red para funcionar.

---

## Monorepo

```
apps/         web (estudio) · daemon (HTTP+SSE) · cli · desktop (PLANNED)
packages/     core orchestrator agents models router design-engine skills
              design-systems project-engine memory vision code-engine execution
              sandbox qa git artifacts schemas telemetry
skills/       13 skills versionables en Markdown (SKILL.md)
design-systems/ direcciones visuales como datos consultables
docs/         research · architecture/ADR · spec · guías por subsistema
tests/        unit · integration · e2e
examples/golden/ proyectos de referencia para el benchmark
```

Documentación completa: [`docs/`](docs/) · Arquitectura: [`ARCHITECTURE.md`](ARCHITECTURE.md) ·
Agentes: [`AGENTS.md`](AGENTS.md) · Seguridad: [`SECURITY.md`](SECURITY.md) ·
Estado real de cada capacidad: [`docs/spec/CAPABILITIES.md`](docs/spec/CAPABILITIES.md).

---

## Estado honesto de v0.1

**Funciona y está cubierto por tests:** el loop completo, discovery, direcciones, `DESIGN.md`,
tokens, prototipo, generación de sitio, QA (código, visual, funcional, a11y, performance,
regresión), reparación automática, verification gate, sandbox, memoria, artifacts versionados,
project map, CLI, daemon y UI.

**Declarado pero no implementado** (y marcado como tal, no presentado como hecho):
desktop shell, marketplace, cloud, deploy adapters a Vercel/Netlify/Cloudflare, persistencia
en SQLite y la UI en React+Vite+Monaco. Ver [`docs/spec/CAPABILITIES.md`](docs/spec/CAPABILITIES.md)
y [`docs/spec/MVP-SCOPE.md`](docs/spec/MVP-SCOPE.md).

**Visual QA con navegador real** requiere Playwright, que es opcional:

```bash
npm i -D playwright && npx playwright install chromium
```

Sin él, NEXORA hace QA estático y **lo dice en el informe**.

## Licencia

Apache-2.0 — ver [`LICENSE`](LICENSE) y [`THIRD-PARTY.md`](THIRD-PARTY.md).
