# ADR-004 — DESIGN.md como contrato visual legible por humanos y agentes

**Estado:** Accepted · 2026-09-19

## Context

Plan §17: cada proyecto debe tener un `DESIGN.md` con 14 secciones, legible por personas y
por agentes. El problema de fondo (§1.4): un sitio puede ser técnicamente correcto y aun así
verse mal, y sin un contrato explícito no hay forma de decir **contra qué** se evalúa lo visual.

## Decision

`DESIGN.md` es la **fuente de verdad visual** del proyecto, en Markdown, con 14 secciones
fijas y un bloque final de tokens CSS. Se genera desde la dirección elegida y la intención
detectada, y cumple tres funciones:

1. **Documentación** para el humano.
2. **Contexto** para los agentes (se inyecta en los prompts).
3. **Criterio de evaluación**: Visual QA compara el resultado contra sus tokens y sus
   anti-patterns; las desviaciones se convierten en issues con evidencia.

Los tokens no son decorativos: `tokensToCss()` los emite como variables CSS, el generador
solo usa `var(--token)` y `findUndeclaredTokens()` detecta valores mágicos fuera del sistema.

## Alternatives

1. **JSON puro** — mejor para máquinas, ilegible para personas; pierde el "por qué" de cada decisión.
2. **Solo tokens, sin prosa** — no captura anti-patterns, voz, ni las decisiones tomadas.
3. **Figma como fuente de verdad** — dependencia externa, no versionable en Git, no legible por el agente sin API.

## Consequences

**Positivas**
- Evaluación visual objetivable: "el contraste de texto secundario es 3.1:1, `DESIGN.md` exige 4.5:1".
- Diffeable en Git: la evolución del diseño queda registrada.
- El usuario puede editarlo a mano y el sistema lo respeta.

**Negativas**
- Markdown requiere parseo tolerante si se edita a mano (mitigado: la fuente canónica es el objeto `DesignSystem`; el `.md` es su render).
- Mantener sincronizados prosa y tokens exige que la generación sea siempre desde el objeto.
