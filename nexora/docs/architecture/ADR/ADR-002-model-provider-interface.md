# ADR-002 — Interfaz de proveedor única y generador determinista como suelo

**Estado:** Accepted · 2026-09-19

## Context

Plan §1.3: "el modelo no es la aplicación". La arquitectura no debe depender de un
proveedor, y debe admitir modelos externos, locales, gratuitos, de pago y futuros. A la vez
(§62, §63) el sistema debe poder **verificar** lo que produce, y no se puede verificar de
forma fiable un pipeline cuya única fuente es no determinista.

## Decision

Dos decisiones acopladas:

1. **Interfaz única** `ModelProvider { id, capabilities, health(), generate(): AsyncIterable<ModelEvent> }`.
   La UI nunca llama a un proveedor; todo pasa por el `ModelRouter`, que enruta por
   capacidades (`TEXT`, `CODE`, `VISION`, `REASONING`, `FAST`, `CHEAP`, `LOCAL`…), con
   retries, timeout, circuit breaker, failover y contabilidad de coste.

2. **El Code Engine tiene un suelo determinista.** `generateSite()` produce siempre un sitio
   válido, dirigido por tokens y sin dependencias. Cuando hay un proveedor real, el agente
   Coder mejora o sustituye ese resultado; cuando no lo hay, el sistema sigue funcionando y
   sigue siendo verificable.

## Alternatives

1. **Solo modelo** — flexible, pero el loop deja de ser testeable y falla sin claves.
2. **Solo plantillas** — determinista, pero entonces esto no es un motor de IA.
3. **Un adapter por SDK oficial** — menos código propio, pero arrastra decenas de dependencias y rompe ADR-008.

## Consequences

**Positivas**
- Añadir un proveedor es un archivo; no toca al resto del sistema.
- El loop completo se prueba en CI (`tests/e2e/autonomous-loop.test.js`).
- Failover real probado con un proveedor que siempre falla.

**Negativas**
- Hay que mantener dos caminos de generación.
- Los adapters HTTP propios deben seguir los cambios de cada API (mitigado: SSE es estable y `HttpProvider` centraliza el parseo).
