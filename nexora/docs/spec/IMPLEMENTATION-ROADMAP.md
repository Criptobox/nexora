# IMPLEMENTATION-ROADMAP.md

## Estado frente al orden de trabajo del plan (§83)

| # | Paso | Estado |
|---:|---|---|
| 01 | Crear repositorio NEXORA | ✅ |
| 02 | Crear README | ✅ |
| 03 | Crear LICENSE | ✅ |
| 04 | Crear THIRD-PARTY | ✅ |
| 05 | Auditar FORJA | ⬜ plantilla lista, requiere acceso al repo |
| 06 | Auditar OpenDesign | 🟡 parcial (flujo sí, código no) |
| 07 | Auditar Design Intelligence | 🟡 parcial (concepto sí, dataset no) |
| 08 | Completar FEATURE-MATRIX | ✅ |
| 09 | Completar COMPETITIVE-MATRIX | ✅ |
| 10 | Definir ADRs iniciales | ✅ 8 ADRs |
| 11 | Definir arquitectura | ✅ |
| 12 | Crear monorepo | ✅ 19 paquetes + 4 apps |
| 13 | Crear schemas | ✅ |
| 14 | Project Engine | ✅ |
| 15 | Model Engine | ✅ |
| 16 | Agent Engine | ✅ |
| 17 | Skill Engine | ✅ |
| 18 | Design Engine | ✅ |
| 19 | Prototype Engine | ✅ |
| 20 | Vision Engine | 🟡 estático ✅, navegador opcional |
| 21 | Code Engine | ✅ |
| 22 | Sandbox | ✅ |
| 23 | QA Engine | ✅ |
| 24 | Conectar Autonomous Loop | ✅ |
| 25 | Crear Golden Projects | ✅ 6 |
| 26 | Ejecutar benchmark | ✅ `npm run benchmark` |
| 27 | Corregir problemas | ✅ 58 tests en verde |
| 28 | Existing Project Mode | 🟡 scan y mapa ✅; modificación guiada pendiente |
| 29 | Memory | ✅ |
| 30 | Git | ✅ |
| 31 | Export | ✅ local; remoto PLANNED |
| 32 | Preparar MVP | ✅ |
| 33 | E2E completo | ✅ |
| 34 | Security audit | ✅ 7 tests + THREAT-MODEL |
| 35 | Visual audit | 🟡 requiere Playwright para ser completo |
| 36 | Release candidate | ⬜ tras cerrar 05-07 y 20 |
| 37 | NEXORA 1.0 | ⬜ |

## Próximos hitos

### v0.2 — Cerrar la verificación visual
1. Integrar Playwright en CI con Chromium cacheado.
2. Comparación de screenshots contra baseline con umbral (CAP-063).
3. Completar `FORJA-AUDIT.md` y `OPENDESIGN-AUDIT.md` leyendo los repos.
4. Question form interactivo en la UI (responder desde el panel).
5. Ampliar el catálogo a ≥ 20 direcciones con verificación automática de contraste.

### v0.3 — Modelos reales en el loop
1. Agente Coder que use el router para superar el generador determinista, con el resultado pasando por el mismo QA.
2. Crítica visual con modelo de visión sobre screenshot.
3. Multi-model collaboration real (designer / critic / coder / QA en paralelo coordinado).
4. Tests de integración con proveedores reales tras flag `NEXORA_LIVE_TESTS=1`.

### v0.4 — Existing Project Mode completo
1. Modificación segura guiada por Project Map.
2. Extracción de `DESIGN.md` desde un proyecto existente.
3. Soporte de frameworks (Next, Vite, Astro) en el Execution Engine.

### v0.5 — Salida
1. Deploy adapters reales (Vercel, Netlify, Cloudflare Pages, GitHub Pages).
2. Multi-página y rutas.
3. UI React + Vite + Monaco.

### v1.0 — MVP estable
Todos los criterios de `MVP-SCOPE.md` en `VERIFIED`, golden projects sin regresión y
release gate verde de forma sostenida.
