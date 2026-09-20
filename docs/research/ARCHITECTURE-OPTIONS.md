# ARCHITECTURE-OPTIONS.md

Opciones evaluadas antes de fijar la arquitectura, con la decisión tomada y su ADR.

## 1. Forma del sistema

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| App monolítica | Simple de arrancar | Imposible sustituir subsistemas; mezcla UI y motor | ❌ |
| **Monorepo con paquetes por responsabilidad** | Límites claros, DAG verificado por el compilador, sustituible pieza a pieza | Más ficheros de configuración | ✅ **Elegida** |
| Microservicios | Escalado independiente | Absurdo para local-first; latencia y operación | ❌ |

## 2. Ejecución del proyecto generado

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| Ejecución directa en el host | Simple | Riesgo inaceptable con código generado por un modelo | ❌ |
| **Sandbox de proceso: allowlist + sin shell + timeouts + rutas confinadas** | Funciona sin Docker, portable, testeable | Aislamiento más débil que un contenedor | ✅ **Elegida** (ADR-003) |
| Docker obligatorio | Aislamiento fuerte | Requisito pesado; rompe local-first | ⏳ Recomendado en producción, no obligatorio |
| WebContainer / WASM | Aislamiento en navegador | Limitado para Node real | ⏳ Futuro |

## 3. Persistencia

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| **JSONL + filesystem** | Cero dependencias nativas, inspeccionable y diffeable a mano | Sin consultas complejas | ✅ **Elegida en v0.1** (ADR-007) |
| SQLite (`better-sqlite3`) | Consultas, transacciones | Dependencia nativa que rompe instalaciones | ⏳ Cuando haya necesidad real |
| `node:sqlite` | Sin dependencia externa | Experimental en Node 20 | ⏳ Reevaluar en Node 22 LTS |

La interfaz `JsonlStore` permite sustituir el backend sin tocar los consumidores.

## 4. Vision / QA visual

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| Solo análisis estático de DOM | Rápido, sin dependencias, siempre disponible | No ve layout real ni errores de consola | ✅ Base siempre activa |
| **Playwright opcional con degradación explícita** | Observación real cuando está; el informe dice cuál se usó | Instalación pesada (~300 MB) | ✅ **Elegida** (ADR-006) |
| Playwright obligatorio | QA completo siempre | Rompe local-first y CI ligero | ❌ |
| Modelo de visión sobre screenshot | Criterio estético | Coste, latencia, no determinista | ⏳ Cuando haya proveedor configurado |

## 5. UI

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| **HTML/CSS/JS nativo servido por el daemon** | Arranca sin red ni bundler; cero deuda | Sin componentes ni editor de código | ✅ **v0.1** (ADR-008) |
| React + Vite + Monaco | Ecosistema, editor potente | ~300 MB de dependencias antes de tener loop verificado | ⏳ Tras `VERIFIED` del loop |
| Electron primero | App de escritorio | El plan lo prohíbe hasta que web sea estable (FASE 17) | ❌ |

## 6. Generación de código

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| 100 % del modelo | Máxima flexibilidad | No determinista; imposible testear el loop; falla sin API key | ❌ como única vía |
| Solo plantillas | Determinista | No es un motor de IA | ❌ |
| **Generador determinista como suelo + modelo que mejora encima** | Siempre produce algo verificable; el loop es testeable end-to-end; el modelo aporta variedad | Hay que mantener el generador | ✅ **Elegida** (ADR-002) |

## 7. Comunicación con la UI

| Opción | Decisión |
|---|---|
| Polling | ❌ latencia y ruido |
| **SSE** | ✅ unidireccional, simple, suficiente para eventos de agente |
| WebSocket | ⏳ cuando haya edición colaborativa |
